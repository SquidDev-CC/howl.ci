package org.squiddev.howl.ci;

import java.io.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Loads config files, resolving environment variables
 */
public class ConfigLoader {
	private static final Pattern pattern = Pattern.compile("\\$\\{([^}|]+)(?:\\|([^}]+))?\\}");

	private final Properties properties;

	private final Set<Runnable> listeners = new HashSet<Runnable>();

	public ConfigLoader(File propertyFile) throws IOException {
		Properties properties = this.properties = new Properties(System.getProperties());

		// Copy some useful properties across
		for (String name : System.getProperties().stringPropertyNames()) {
			if (name.startsWith("user.") || name.startsWith("os.")) {
				properties.setProperty(name, System.getProperty(name));
			}
		}

		// Attempt to load the default property file
		InputStream stream = ConfigLoader.class.getResourceAsStream("default.properties");
		if (stream == null) throw new FileNotFoundException("Cannot find default property file");

		try {
			properties.load(stream);
		} finally {
			stream.close();
		}

		// Attempt to load the specified property file
		if (propertyFile.isFile()) {
			InputStream propertyStream = new FileInputStream(propertyFile);
			try {
				properties.load(propertyStream);
			} finally {
				propertyStream.close();
			}
		}

		// Resolve all environment variables
		for (String key : getKeys()) {
			properties.setProperty(key, replaceEnvironment(getProperty(key)));
		}
	}

	/**
	 * Add a config listener.
	 *
	 * This will be fired when attached or whenever a property changes.
	 *
	 * @param listener The listener to add
	 */
	public void addListener(Runnable listener) {
		listeners.add(listener);
		listener.run();
	}

	/**
	 * Searches for the property with the specified key.
	 *
	 * @param key The property key
	 * @return The resulting value. Will be {@code null} if the value is not found.
	 * @see Properties#getProperty(String)
	 */
	public String getProperty(String key) {
		return properties.getProperty(key);
	}

	/**
	 * Searches for the property with the specified key, falling back
	 * to a default if not found.
	 *
	 * @param key          The property key
	 * @param defaultValue Default value
	 * @return The resulting value. Will be {@code defaultValue} if not found
	 * @see Properties#getProperty(String, String)
	 */
	public String getProperty(String key, String defaultValue) {
		return properties.getProperty(key, defaultValue);
	}

	/**
	 * Get all specified property names.
	 *
	 * @return All specified property names.
	 */
	public Set<String> getKeys() {
		Set<String> out = new HashSet<String>(properties.size());
		for (Object key : properties.keySet()) {
			out.add((String) key);
		}
		return Collections.unmodifiableSet(out);
	}

	/**
	 * Set a property to the specified value.
	 *
	 * @param key   The key to set
	 * @param value The value to set to
	 */
	public void setProperty(String key, String value) {
		properties.setProperty(key, value);
		for (Runnable listener : listeners) listener.run();
	}

	private static String replaceEnvironment(String value) {
		Matcher match = pattern.matcher(value);
		if (!match.find()) return value;

		StringBuilder sb = new StringBuilder();
		int last = 0;
		do {
			sb.append(value, last, match.start());

			String key = match.group(1).trim();

			String val = System.getenv(key);
			// Allow falling back to a default
			if (val == null) val = match.group(2);
			// Otherwise just use the existing string
			if (val == null) val = "${" + key + "}";
			val = val.trim();

			sb.append(val);
			last = match.end();
		} while (match.find());

		sb.append(value, last, value.length());
		return sb.toString();
	}
}
