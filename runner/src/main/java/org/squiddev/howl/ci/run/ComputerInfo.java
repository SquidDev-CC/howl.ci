package org.squiddev.howl.ci.run;

/**
 * Information about computers
 */
public class ComputerInfo {
	public String label = null;

	public long spaceLimit = Long.MAX_VALUE;
	public String saveDir = null;
	public String startupFile;

	public boolean color = true;
	public int width = 51;
	public int height = 19;

	public ComputerInfo() {
	}

	public ComputerInfo(ComputerInfo info) {
		label = info.label;

		spaceLimit = info.spaceLimit;
		saveDir = info.saveDir;
		startupFile = info.startupFile;

		color = info.color;
		width = info.width;
		height = info.height;
	}
}
