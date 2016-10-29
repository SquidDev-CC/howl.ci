package org.squiddev.howl.ci.run;

import dan200.computercraft.api.lua.ILuaContext;
import dan200.computercraft.api.lua.LuaException;
import dan200.computercraft.core.apis.ILuaAPI;
import org.squiddev.howl.ci.TRoRLogger;


public class HowlAPI implements ILuaAPI {
	private final Emulator emulator;
	private final ComputerInstance computer;

	public HowlAPI(Emulator emulator, ComputerInstance computer) {
		this.emulator = emulator;
		this.computer = computer;
	}

	@Override
	public String[] getNames() {
		return new String[]{"howlci"};
	}

	@Override
	public void startup() {

	}

	@Override
	public void advance(double v) {
	}

	@Override
	public void shutdown() {

	}

	@Override
	public String[] getMethodNames() {
		return new String[]{
			"debug", "warn", "error", "status",
			"getEnv", "getConfig",
			"setDay", "setTime",
			"close", "resize",
			// TODO: open
		};
	}

	@Override
	public Object[] callMethod(ILuaContext context, int method, Object[] args) throws LuaException, InterruptedException {
		switch (method) {
			case 0: { // debug
				if (args.length == 0) throw new LuaException("Expected message");
				emulator.getLogger().debug(computer.getIdentifier(), String.valueOf(args[0]));
				return null;
			}
			case 1: { // warn
				if (args.length == 0) throw new LuaException("Expected message");
				emulator.getLogger().warn(computer.getIdentifier(), String.valueOf(args[0]));
				return null;
			}
			case 2: { // error
				if (args.length == 0) throw new LuaException("Expected message");
				emulator.getLogger().error(computer.getIdentifier(), String.valueOf(args[0]));
				return null;
			}
			case 3: { // status
				if (args.length < 2) throw new LuaException("Expected status, message");

				String statusName = String.valueOf(args[0]);
				TRoRLogger.Status status;
				if (statusName.equalsIgnoreCase("success") || statusName.equalsIgnoreCase("pass") || statusName.equalsIgnoreCase("ok")) {
					status = TRoRLogger.Status.SUCCESS;
				} else if (statusName.equalsIgnoreCase("fail") || statusName.equalsIgnoreCase("failure") || statusName.equalsIgnoreCase("failed")) {
					status = TRoRLogger.Status.FAILURE;
				} else if (statusName.equalsIgnoreCase("error")) {
					status = TRoRLogger.Status.ERROR;
				} else {
					throw new LuaException("Unknown status " + statusName);
				}

				emulator.getLogger().status(computer.getIdentifier(), status, String.valueOf(args[1]));

				return null;
			}
			case 4: // getEnv
				if (args.length == 0 || !(args[0] instanceof String)) throw new LuaException("Expected string");
				return new Object[]{System.getenv((String) args[0])};
			case 5: // getConfig
				if (args.length == 0 || !(args[0] instanceof String)) throw new LuaException("Expected string");
				return new Object[]{emulator.getConfig().getProperty((String) args[0])};
			case 6: { // setDay
				if (args.length == 0 || !(args[0] instanceof Number)) throw new LuaException("Expected number");

				int day = ((Number) args[0]).intValue();
				if (day < 0) throw new LuaException("Day out of range (day >= 0)");

				emulator.day = day;

				return null;
			}
			case 7: { // setTime
				if (args.length == 0 || !(args[0] instanceof Number)) throw new LuaException("Expected number");

				double time = ((Number) args[0]).doubleValue();
				if (time < 0) throw new LuaException("Time out of range (time >= 0)");

				emulator.time = time % Emulator.DAY_LENGTH;

				return null;
			}
			case 8: // close
				computer.close();
				return null;
			case 9: { // resize
				if (args.length < 2 || !(args[0] instanceof Number) || !(args[1] instanceof Number)) {
					throw new LuaException("Expected number, number");
				}

				int width = ((Number) args[0]).intValue();
				int height = ((Number) args[1]).intValue();

				if (width < 1 || width > 255) {
					throw new LuaException("Width out of range (1 <= width <= 255");
				}

				if (height < 1 || height > 255) {
					throw new LuaException("Height out of range (1 <= height <= 255");
				}

				computer.getTerminal().resize(width, height);
				return null;
			}

			default:
				throw new IllegalStateException("Unknown method " + method);
		}
	}
}
