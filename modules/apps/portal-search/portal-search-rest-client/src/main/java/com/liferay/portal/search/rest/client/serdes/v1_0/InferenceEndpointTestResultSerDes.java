/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.rest.client.serdes.v1_0;

import com.liferay.portal.search.rest.client.dto.v1_0.InferenceEndpointTestResult;
import com.liferay.portal.search.rest.client.json.BaseJSONParser;

import jakarta.annotation.Generated;

import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

/**
 * @author Petteri Karttunen
 * @generated
 */
@Generated("")
public class InferenceEndpointTestResultSerDes {

	public static InferenceEndpointTestResult toDTO(String json) {
		InferenceEndpointTestResultJSONParser
			inferenceEndpointTestResultJSONParser =
				new InferenceEndpointTestResultJSONParser();

		return inferenceEndpointTestResultJSONParser.parseToDTO(json);
	}

	public static InferenceEndpointTestResult[] toDTOs(String json) {
		InferenceEndpointTestResultJSONParser
			inferenceEndpointTestResultJSONParser =
				new InferenceEndpointTestResultJSONParser();

		return inferenceEndpointTestResultJSONParser.parseToDTOs(json);
	}

	public static String toJSON(
		InferenceEndpointTestResult inferenceEndpointTestResult) {

		if (inferenceEndpointTestResult == null) {
			return "null";
		}

		StringBuilder sb = new StringBuilder();

		sb.append("{");

		if (inferenceEndpointTestResult.getDimensions() != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"dimensions\": ");

			sb.append(inferenceEndpointTestResult.getDimensions());
		}

		if (inferenceEndpointTestResult.getErrorMessage() != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"errorMessage\": ");

			sb.append("\"");

			sb.append(_escape(inferenceEndpointTestResult.getErrorMessage()));

			sb.append("\"");
		}

		if (inferenceEndpointTestResult.getModelId() != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"modelId\": ");

			sb.append("\"");

			sb.append(_escape(inferenceEndpointTestResult.getModelId()));

			sb.append("\"");
		}

		if (inferenceEndpointTestResult.getResponseTime() != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"responseTime\": ");

			sb.append(inferenceEndpointTestResult.getResponseTime());
		}

		sb.append("}");

		return sb.toString();
	}

	public static Map<String, Object> toMap(String json) {
		InferenceEndpointTestResultJSONParser
			inferenceEndpointTestResultJSONParser =
				new InferenceEndpointTestResultJSONParser();

		return inferenceEndpointTestResultJSONParser.parseToMap(json);
	}

	public static Map<String, String> toMap(
		InferenceEndpointTestResult inferenceEndpointTestResult) {

		if (inferenceEndpointTestResult == null) {
			return null;
		}

		Map<String, String> map = new TreeMap<>();

		if (inferenceEndpointTestResult.getDimensions() == null) {
			map.put("dimensions", null);
		}
		else {
			map.put(
				"dimensions",
				String.valueOf(inferenceEndpointTestResult.getDimensions()));
		}

		if (inferenceEndpointTestResult.getErrorMessage() == null) {
			map.put("errorMessage", null);
		}
		else {
			map.put(
				"errorMessage",
				String.valueOf(inferenceEndpointTestResult.getErrorMessage()));
		}

		if (inferenceEndpointTestResult.getModelId() == null) {
			map.put("modelId", null);
		}
		else {
			map.put(
				"modelId",
				String.valueOf(inferenceEndpointTestResult.getModelId()));
		}

		if (inferenceEndpointTestResult.getResponseTime() == null) {
			map.put("responseTime", null);
		}
		else {
			map.put(
				"responseTime",
				String.valueOf(inferenceEndpointTestResult.getResponseTime()));
		}

		return map;
	}

	public static class InferenceEndpointTestResultJSONParser
		extends BaseJSONParser<InferenceEndpointTestResult> {

		@Override
		protected InferenceEndpointTestResult createDTO() {
			return new InferenceEndpointTestResult();
		}

		@Override
		protected InferenceEndpointTestResult[] createDTOArray(int size) {
			return new InferenceEndpointTestResult[size];
		}

		@Override
		protected boolean parseMaps(String jsonParserFieldName) {
			if (Objects.equals(jsonParserFieldName, "dimensions")) {
				return false;
			}
			else if (Objects.equals(jsonParserFieldName, "errorMessage")) {
				return false;
			}
			else if (Objects.equals(jsonParserFieldName, "modelId")) {
				return false;
			}
			else if (Objects.equals(jsonParserFieldName, "responseTime")) {
				return false;
			}

			return false;
		}

		@Override
		protected void setField(
			InferenceEndpointTestResult inferenceEndpointTestResult,
			String jsonParserFieldName, Object jsonParserFieldValue) {

			if (Objects.equals(jsonParserFieldName, "dimensions")) {
				if (jsonParserFieldValue != null) {
					inferenceEndpointTestResult.setDimensions(
						Integer.valueOf((String)jsonParserFieldValue));
				}
			}
			else if (Objects.equals(jsonParserFieldName, "errorMessage")) {
				if (jsonParserFieldValue != null) {
					inferenceEndpointTestResult.setErrorMessage(
						(String)jsonParserFieldValue);
				}
			}
			else if (Objects.equals(jsonParserFieldName, "modelId")) {
				if (jsonParserFieldValue != null) {
					inferenceEndpointTestResult.setModelId(
						(String)jsonParserFieldValue);
				}
			}
			else if (Objects.equals(jsonParserFieldName, "responseTime")) {
				if (jsonParserFieldValue != null) {
					inferenceEndpointTestResult.setResponseTime(
						Long.valueOf((String)jsonParserFieldValue));
				}
			}
		}

	}

	private static String _escape(Object object) {
		String string = String.valueOf(object);

		for (String[] strings : BaseJSONParser.JSON_ESCAPE_STRINGS) {
			string = string.replace(strings[0], strings[1]);
		}

		return string;
	}

	private static String _toJSON(Map<String, ?> map) {
		StringBuilder sb = new StringBuilder("{");

		@SuppressWarnings("unchecked")
		Set set = map.entrySet();

		@SuppressWarnings("unchecked")
		Iterator<Map.Entry<String, ?>> iterator = set.iterator();

		while (iterator.hasNext()) {
			Map.Entry<String, ?> entry = iterator.next();

			sb.append("\"");
			sb.append(entry.getKey());
			sb.append("\": ");

			Object value = entry.getValue();

			sb.append(_toJSON(value));

			if (iterator.hasNext()) {
				sb.append(", ");
			}
		}

		sb.append("}");

		return sb.toString();
	}

	private static String _toJSON(Object value) {
		if (value == null) {
			return "null";
		}

		if (value instanceof Map) {
			return _toJSON((Map)value);
		}

		Class<?> clazz = value.getClass();

		if (clazz.isArray()) {
			StringBuilder sb = new StringBuilder("[");

			Object[] values = (Object[])value;

			for (int i = 0; i < values.length; i++) {
				sb.append(_toJSON(values[i]));

				if ((i + 1) < values.length) {
					sb.append(", ");
				}
			}

			sb.append("]");

			return sb.toString();
		}

		if (value instanceof String) {
			return "\"" + _escape(value) + "\"";
		}

		return String.valueOf(value);
	}

}
// LIFERAY-REST-BUILDER-HASH:653907148