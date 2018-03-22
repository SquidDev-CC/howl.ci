package org.squiddev.howl.ci;

import org.squiddev.cctweaks.lua.launch.ClassLoaderHelpers;
import org.squiddev.cctweaks.lua.launch.DelegatingRewritingLoader;
import org.squiddev.cctweaks.lua.launch.PriorityURLClassLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
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

		try {
			// Setup the new loader, using the CC Jar
			DelegatingRewritingLoader loader = new DelegatingRewritingLoader(
				new PriorityURLClassLoader(new URL[]{mainJar.toURI().toURL()}, ClassLoader.getSystemClassLoader()),
				new File("asm/cctweaks")
			);
			loader.addClassLoaderExclusion("org.squiddev.howl.ci.ConfigLoader");
			loader.addClassLoaderExclusion("org.squiddev.howl.ci.TRoRLogger");

			// Setup CCTweaks if needed
			String methodName;
			if (Boolean.parseBoolean(config.getProperty("cctweaks.enabled"))) {
				try {
					ClassLoaderHelpers.loadPropertyConfig(loader);
					ClassLoaderHelpers.syncDump(loader);
					ClassLoaderHelpers.setupChain(loader);
				} catch (Exception e) {
					throw new LaunchException("Unexpected error loading CCTweaks", e);
				}

				methodName = "runCCTweaks";
			} else {
				methodName = "run";
			}

			// Finalise launching and start the runner
			loader.chain().finalise();
			Thread.currentThread().setContextClassLoader(loader);

			loader.loadClass("org.squiddev.howl.ci.run.Runner")
				.getMethod(methodName, File.class, ConfigLoader.class, TRoRLogger.class)
				.invoke(null, mainJar, config, logger);
		} catch (Exception e) {
			throw new LaunchException("Cannot load runner", e);
		}
	}
}
