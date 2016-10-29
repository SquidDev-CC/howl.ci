package org.squiddev.howl.ci.run;

import dan200.computercraft.ComputerCraft;
import dan200.computercraft.api.filesystem.IMount;
import dan200.computercraft.api.filesystem.IWritableMount;
import dan200.computercraft.core.computer.Computer;
import dan200.computercraft.core.computer.ComputerThread;
import dan200.computercraft.core.computer.ITask;
import dan200.computercraft.core.computer.MainThread;
import dan200.computercraft.core.filesystem.FileMount;
import dan200.computercraft.core.filesystem.JarMount;
import org.squiddev.howl.ci.ConfigLoader;
import org.squiddev.howl.ci.TRoRLogger;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Emulator {
	private static final Pattern COMP_PATTERN = Pattern.compile("computer/(\\d+)");

	public static final double DAY_LENGTH = 24000;
	private static final long TICK_AMOUNT = 50;

	private int id;

	private final File mainJar;
	private final File root;
	private final TRoRLogger logger;
	private final ConfigLoader config;

	private final Map<String, String> saveDirs = new HashMap<String, String>();
	private final Map<Integer, ComputerInfo> computerInfo = new HashMap<Integer, ComputerInfo>();

	private final Set<ComputerInstance> computers = new HashSet<ComputerInstance>();
	private int instanceId = 0;

	public double time = 0;
	public int day = 0;

	public Emulator(File mainJar, TRoRLogger logger, ConfigLoader config) {
		this.mainJar = mainJar;
		this.logger = logger;
		this.config = config;
		this.root = new File(config.getProperty("user.dir"));
	}

	public int getDay() {
		return day;
	}

	public double getTimeOfDay() {
		return time;
	}

	public String getHostString() {
		return "ComputerCraft " + ComputerCraft.getVersion() + " (howl.ci)";
	}

	public IWritableMount createSaveDirMount(String subPath, long capacity) {
		ComputerInfo info = null;
		Matcher matcher = COMP_PATTERN.matcher(subPath);
		if (matcher.matches()) {
			info = computerInfo.get(Integer.parseInt(matcher.group(1)));
		}

		String reroute = saveDirs.get(subPath);
		if (reroute != null) subPath = reroute;

		IWritableMount mount = new FileMount(new File(root, subPath), capacity);

		if (info != null && info.startupFile != null) {
			PrintWriter writer = null;
			try {
				writer = new PrintWriter(mount.openForWrite("startup"));
				String startup = info.startupFile
					.replace("\n", "\\n")
					.replace("\r", "\\r")
					.replace("\"", "\\\"")
					.replace("\t", "\\\t")
					.replace("\\", "\\\\");

				writer.println("shell.run(\"" + startup + "\")");
				writer.println("os.shutdown()");
			} catch (IOException e) {
				logger.error(TRoRLogger.CORE_ID, "Cannot inject startup file " + info.startupFile, e);
			} finally {
				if (writer != null) writer.close();
			}
		}

		return mount;
	}

	public IMount createResourceMount(String domain, String subPath) {
		try {
			return new JarMount(mainJar, "assets/" + domain + "/" + subPath);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	public synchronized int assignNewID() {
		return id++;
	}

	public TRoRLogger getLogger() {
		return logger;
	}

	public ConfigLoader getConfig() {
		return config;
	}

	public void addSaveDirMapping(String from, String to) {
		saveDirs.put(from, to);
	}

	public void addComputerInfo(int id, ComputerInfo info) {
		computerInfo.put(id, new ComputerInfo(info));
		if (info.saveDir != null) addSaveDirMapping("computer/" + id, info.saveDir);
	}

	public ComputerInstance createComputer(int id) {
		if (id < 0) id = assignNewID();

		ComputerInfo info = computerInfo.get(id);
		if (info == null) info = new ComputerInfo();

		synchronized (computers) {
			int instance = instanceId++;

			ComputerInstance computer = new ComputerInstance(this, id, instance, info);
			this.computers.add(computer);
			return computer;
		}
	}

	public void removeComputer(ComputerInstance computer) {
		computer.shutdown();
		synchronized (computers) {
			computers.remove(computer);
		}
	}

	public void run() {
		try {
			long lastTick = System.currentTimeMillis();
			boolean alive = true;
			while (alive) {
				long start = System.currentTimeMillis();
				double dt = (start - lastTick) / 1000.0;

				time += dt;
				if (time > DAY_LENGTH) {
					time = 0;
					day++;
				}

				// *Technically* not needed but good to have
				MainThread.executePendingTasks();

				synchronized (computers) {
					Set<ComputerInstance> dead = new HashSet<ComputerInstance>();
					for (ComputerInstance computer : computers) {
						if (!computer.update(dt)) dead.add(computer);
					}

					for (ComputerInstance computer : dead) {
						computer.close();
					}

					alive = computers.size() > 0;
				}

				lastTick = System.currentTimeMillis();

				// Ensure the entire tick took TICK_AMOUNT seconds
				long took = lastTick - start;
				if (took < TICK_AMOUNT) {
					Thread.sleep(TICK_AMOUNT - took);
				}
			}
		} catch (InterruptedException e) {
			logger.error(TRoRLogger.CORE_ID, "Interrupted", e);
		} finally {
			synchronized (computers) {
				for (ComputerInstance computer : computers) {
					computer.shutdown();
				}
			}
			ComputerThread.stop();

			// We queue a void task to hopefully clear out the thread
			ComputerThread.queueTask(voidTask, null);
		}

		logger.debug(TRoRLogger.CORE_ID, "Finished");
	}

	private static final ITask voidTask = new ITask() {
		@Override
		public Computer getOwner() {
			return null;
		}

		@Override
		public void execute() {

		}
	};
}
