package org.squiddev.howl.ci.run;

import dan200.computercraft.api.filesystem.IMount;
import dan200.computercraft.api.filesystem.IWritableMount;
import dan200.computercraft.core.computer.Computer;
import dan200.computercraft.core.computer.IComputerEnvironment;
import dan200.computercraft.core.terminal.Terminal;

import java.io.Closeable;
import java.util.HashSet;
import java.util.Set;

public class ComputerInstance implements IComputerEnvironment, Closeable {
	private static final int COOLDOWN_PERIOD = 20;

	public interface IComputerListener {
		void update(double dt);

		void close();
	}

	private final Emulator emulator;
	private final ComputerInfo info;

	private final Computer computer;
	private final Terminal terminal;

	private final String id;

	private int cooldown = COOLDOWN_PERIOD;

	private final Set<IComputerListener> listeners = new HashSet<IComputerListener>();

	public ComputerInstance(Emulator emulator, int id, int instance, ComputerInfo info) {
		this.emulator = emulator;
		this.id = instance + ":" + id;
		this.info = info;

		if (Boolean.parseBoolean(emulator.getConfig().getProperty("howlci.chunking"))) {
			terminal = new TerminalChunking(info.width, info.height, this.id, emulator.getLogger());
		} else {
			terminal = new TerminalStreaming(info.width, info.height, this.id, emulator.getLogger());
		}

		if (terminal instanceof IComputerListener) {
			listeners.add((IComputerListener) terminal);
		}

		computer = new Computer(this, terminal, id);
		computer.setLabel(info.label);

		if (Boolean.parseBoolean(emulator.getConfig().getProperty("howlci.api"))) {
			computer.addAPI(new HowlAPI(emulator, this));
		}
	}

	@Override
	public int getDay() {
		return emulator.getDay();
	}

	@Override
	public double getTimeOfDay() {
		return emulator.getTimeOfDay();
	}

	@Override
	public boolean isColour() {
		return info.color;
	}

	@Override
	public long getComputerSpaceLimit() {
		return info.spaceLimit;
	}

	@Override
	public String getHostString() {
		return emulator.getHostString();
	}

	@Override
	public int assignNewID() {
		return emulator.assignNewID();
	}

	@Override
	public IWritableMount createSaveDirMount(String s, long l) {
		return emulator.createSaveDirMount(s, l);
	}

	@Override
	public IMount createResourceMount(String s, String s1) {
		return emulator.createResourceMount(s, s1);
	}

	@Override
	public void close() {
		shutdown();

		for (IComputerListener listener : listeners) {
			listener.close();
		}

		emulator.removeComputer(this);
	}

	public String getIdentifier() {
		return id;
	}

	public Terminal getTerminal() {
		return terminal;
	}

	public void turnOn() {
		computer.turnOn();
	}

	public void shutdown() {
		computer.shutdown();
	}

	public boolean update(double dt) {
		computer.advance(dt);

		for (IComputerListener listener : listeners) {
			listener.update(dt);
		}

		if (computer.isOn()) {
			cooldown = COOLDOWN_PERIOD;
		} else if (cooldown >= 0) {
			cooldown--;
		}

		return cooldown >= 0;
	}
}
