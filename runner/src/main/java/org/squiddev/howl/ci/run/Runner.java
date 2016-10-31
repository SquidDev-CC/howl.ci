package org.squiddev.howl.ci.run;

import dan200.computercraft.ComputerCraft;
import org.squiddev.cctweaks.lua.ConfigPropertyLoader;
import org.squiddev.cctweaks.lua.lib.ApiRegister;
import org.squiddev.howl.ci.ConfigLoader;
import org.squiddev.howl.ci.TRoRLogger;
import org.squiddev.patcher.Logger;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The main executor
 */
public class Runner {
	private static final Pattern COMPUTER_PATTERN = Pattern.compile("computer\\.(\\d+)\\.(\\w+)");

	public static void runCCTweaks(File mainJar, final ConfigLoader config, final TRoRLogger logger) {
		config.addListener(new Runnable() {
			@Override
			public void run() {
				for (String key : config.getKeys()) {
					if (key.startsWith("cctweaks.")) {
						System.setProperty(key, config.getProperty(key));
					}
				}
				ConfigPropertyLoader.init();
			}
		});

		Logger.instance = new Logger() {
			@Override
			public void doDebug(String message) {
				logger.debug(TRoRLogger.CORE_ID, message);
			}

			@Override
			public void doWarn(String message) {
				logger.warn(TRoRLogger.CORE_ID, message);
			}

			@Override
			public void doError(String message, Throwable e) {
				logger.error(TRoRLogger.CORE_ID, message, e);
			}
		};

		ApiRegister.init();

		run(mainJar, config, logger);
	}

	public static void run(File mainJar, final ConfigLoader config, final TRoRLogger logger) {
		// Load various computer specific settings
		Map<Integer, ComputerInfo> computers = new HashMap<Integer, ComputerInfo>();
		for (String key : config.getKeys()) {
			Matcher match = COMPUTER_PATTERN.matcher(key);
			if (match.matches()) {
				int id = Integer.parseInt(match.group(1));
				String value = config.getProperty(key);

				ComputerInfo info = computers.get(id);

				if (info == null) {
					info = new ComputerInfo();
					computers.put(id, info);
				}

				String field = match.group(2);
				if (field.equals("label")) {
					info.label = value;
				} else if (field.equals("saveDir")) {
					info.saveDir = value;
				} else if (field.equals("color") || field.equals("colour")) {
					info.color = Boolean.parseBoolean(value);
				} else if (field.equals("width")) {
					info.width = Integer.parseInt(value);
				} else if (field.equals("height")) {
					info.height = Integer.parseInt(value);
				} else if (field.equals("spaceLimit")) {
					info.spaceLimit = Long.parseLong(value);
				} else if (field.equals("startup")) {
					info.startupFile = value;
				} else {
					logger.warn(TRoRLogger.CORE_ID, "Unknown option " + field + " for computer " + id);
				}
			}
		}

		// Load various ComputerCraft specific entries
		config.addListener(new Runnable() {
			@Override
			public void run() {
				double version = Double.parseDouble(ComputerCraft.getVersion());
				if (version >= 1.77) {
					ComputerCraft.default_computer_settings = config.getProperty("computercraft.defaultSettings", "");
				}

				if (version >= 1.74) {
					ComputerCraft.disable_lua51_features = Boolean.parseBoolean(config.getProperty("computercraft.disable51", "false"));
				}

				if (version >= 63) {
					ComputerCraft.http_whitelist = config.getProperty("computercraft.whitelist", "*");
				}

				ComputerCraft.http_enable = Boolean.parseBoolean(config.getProperty("computercraft.http", "true"));

			}
		});

		Emulator environment = new Emulator(mainJar, logger, config);

		for (Map.Entry<Integer, ComputerInfo> info : computers.entrySet()) {
			environment.addComputerInfo(info.getKey(), info.getValue());
		}

		environment.createComputer(0).turnOn();
		environment.run();
	}
}
