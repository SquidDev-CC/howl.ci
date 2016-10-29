package org.squiddev.howl.ci;

import org.squiddev.cctweaks.lua.launch.RewritingLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.net.*;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.Map;


/**
 * Handles launching howl.ci
 */
public class Launch {
	private static class LaunchException extends Exception {
		private static final long serialVersionUID = 2520407418479296827L;

		public LaunchException(String message) {
			super(message);
		}

		public LaunchException(String message, Throwable cause) {
			super(message, cause);
		}
	}

	public static void main(String[] args) {
		TRoRLogger logger = new TRoRLogger(System.out);
		try {
			run(logger);
		} catch (LaunchException e) {
			logger.error(TRoRLogger.CORE_ID, e.getMessage(), e.getCause());
		}

		if (logger.getStatus() == TRoRLogger.Status.NONE) {
			logger.status(TRoRLogger.CORE_ID, TRoRLogger.Status.ERROR, "No status set");
		}

		// Display all ComputerCraft threads we're waiting on
		for (Map.Entry<Thread, StackTraceElement[]> trace : Thread.getAllStackTraces().entrySet()) {
			boolean write = false;
			for (StackTraceElement traceElement : trace.getValue()) {
				String className = traceElement.getClassName();
				if (className.startsWith("dan200.") || className.startsWith("org.squiddev.cctweaks.")) {
					write = true;
					break;
				}
			}

			if (write) {
				System.out.println("Waiting on " + trace.getKey().toString());
				for (StackTraceElement traceElement : trace.getValue()) {
					System.out.println("\tat " + traceElement);
				}
				System.out.println();
			}
		}

		System.exit(logger.getStatus() == TRoRLogger.Status.SUCCESS ? 0 : 1);
	}

	private static void run(TRoRLogger logger) throws LaunchException {
		// Load config options
		ConfigLoader config;
		try {
			config = new ConfigLoader(new File(".howl.ci.properties"));
		} catch (Exception e) {
			throw new LaunchException("Unexpected exception when loading config file", e);
		}

		// Attempt to download ComputerCraft
		File mainJar = new File(config.getProperty("computercraft.file"));
		if (!mainJar.exists()) {
			URL website;
			try {
				website = new URL(config.getProperty("computercraft.url"));
			} catch (MalformedURLException e) {
				throw new LaunchException("computercraft.url is in an invalid format", e);
			}

			ReadableByteChannel rbc = null;
			FileOutputStream fos = null;

			try {
				int redirects = 0;
				URLConnection connection;
				while (true) {
					logger.debug(TRoRLogger.CORE_ID, "Downloading from " + website);
					connection = website.openConnection();

					// Handle redirects in HttpURLConnection
					if (connection instanceof HttpURLConnection) {
						HttpURLConnection http = (HttpURLConnection) connection;
						connection.connect();

						int code = http.getResponseCode();
						if (code == HttpURLConnection.HTTP_MOVED_TEMP || code == HttpURLConnection.HTTP_MOVED_PERM || code == HttpURLConnection.HTTP_SEE_OTHER) {
							String location = http.getHeaderField("Location");
							((HttpURLConnection) connection).disconnect();

							if (location == null) {
								throw new LaunchException("Redirecting from " + website + " to nothing");
							} else if (++redirects > 5) {
								throw new LaunchException("More than 5 redirects from " + website + " to " + location);
							}

							website = new URL(location);
							continue;
						}
					}

					break;
				}

				rbc = Channels.newChannel(connection.getInputStream());
				fos = new FileOutputStream(mainJar);
				fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
			} catch (IOException e) {
				throw new LaunchException("Failed to download ComputerCraft", e);
			} finally {
				if (rbc != null) {
					try {
						rbc.close();
					} catch (IOException ignored) {
					}
				}
				if (fos != null) {
					try {
						fos.close();
					} catch (IOException ignored) {
					}
				}
			}
		} else if (!mainJar.isFile()) {
			throw new LaunchException("computercraft.file is not a file");
		}

		// Add ComputerCraft to the class path
		URLClassLoader defaultLoader = (URLClassLoader) ClassLoader.getSystemClassLoader();
		URL[] urls = defaultLoader.getURLs();

		URL[] newUrls = new URL[urls.length + 1];
		System.arraycopy(urls, 0, newUrls, 0, urls.length);
		try {
			newUrls[urls.length] = mainJar.toURI().toURL();
		} catch (MalformedURLException e) {
			throw new LaunchException("Cannot parse computercraft.file", e);
		}

		// Setup the appropriate loader.
		String methodName;
		RewritingLoader loader = new RewritingLoader(newUrls, new File("asm/cctweaks"));
		loader.addClassLoaderExclusion("org.squiddev.howl.ci.ConfigLoader");
		loader.addClassLoaderExclusion("org.squiddev.howl.ci.TRoRLogger");

		if (Boolean.parseBoolean(config.getProperty("cctweaks.enabled"))) {
			try {
				loader.loadConfig();
				loader.loadChain();
			} catch (Exception e) {
				throw new LaunchException("Unexpected error loading CCTweaks", e);
			}

			loader.chain.finalise();

			methodName = "runCCTweaks";
		} else {
			methodName = "run";
		}

		Thread.currentThread().setContextClassLoader(loader);

		try {
			loader.loadClass("org.squiddev.howl.ci.run.Runner")
				.getMethod(methodName, File.class, ConfigLoader.class, TRoRLogger.class)
				.invoke(null, mainJar, config, logger);
		} catch (NoSuchMethodException e) {
			throw new LaunchException("Cannot load runner", e);
		} catch (IllegalAccessException e) {
			throw new LaunchException("Cannot load runner", e);
		} catch (InvocationTargetException e) {
			throw new LaunchException("Cannot load runner", e);
		} catch (ClassNotFoundException e) {
			throw new LaunchException("Cannot load runner", e);
		}
	}
}
