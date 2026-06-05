/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.rest.dto.v1_0;

import com.fasterxml.jackson.annotation.JsonFilter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.liferay.petra.function.UnsafeSupplier;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.vulcan.graphql.annotation.GraphQLField;
import com.liferay.portal.vulcan.graphql.annotation.GraphQLName;
import com.liferay.portal.vulcan.util.ObjectMapperUtil;

import jakarta.annotation.Generated;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;

import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Supplier;

/**
 * @author Petteri Karttunen
 * @generated
 */
@Generated("")
@GraphQLName(
	description = "Result of testing the active Elasticsearch inference endpoint with a deterministic sample text. Carries the dimensions of the returned embedding, the endpoint's model, and the response time on success, or an error message on failure.",
	value = "InferenceEndpointTestResult"
)
@JsonFilter("Liferay.Vulcan")
@XmlRootElement(name = "InferenceEndpointTestResult")
public class InferenceEndpointTestResult implements Serializable {

	public static InferenceEndpointTestResult toDTO(String json) {
		return ObjectMapperUtil.readValue(
			InferenceEndpointTestResult.class, json);
	}

	public static InferenceEndpointTestResult unsafeToDTO(String json) {
		return ObjectMapperUtil.unsafeReadValue(
			InferenceEndpointTestResult.class, json);
	}

	@io.swagger.v3.oas.annotations.media.Schema
	public Integer getDimensions() {
		if (_dimensionsSupplier != null) {
			dimensions = _dimensionsSupplier.get();

			_dimensionsSupplier = null;
		}

		return dimensions;
	}

	public void setDimensions(Integer dimensions) {
		this.dimensions = dimensions;

		_dimensionsSupplier = null;
	}

	@JsonIgnore
	public void setDimensions(
		UnsafeSupplier<Integer, Exception> dimensionsUnsafeSupplier) {

		_dimensionsSupplier = () -> {
			try {
				return dimensionsUnsafeSupplier.get();
			}
			catch (RuntimeException runtimeException) {
				throw runtimeException;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		};
	}

	@GraphQLField
	@JsonProperty(access = JsonProperty.Access.READ_WRITE)
	protected Integer dimensions;

	@JsonIgnore
	private Supplier<Integer> _dimensionsSupplier;

	@io.swagger.v3.oas.annotations.media.Schema
	public String getErrorMessage() {
		if (_errorMessageSupplier != null) {
			errorMessage = _errorMessageSupplier.get();

			_errorMessageSupplier = null;
		}

		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;

		_errorMessageSupplier = null;
	}

	@JsonIgnore
	public void setErrorMessage(
		UnsafeSupplier<String, Exception> errorMessageUnsafeSupplier) {

		_errorMessageSupplier = () -> {
			try {
				return errorMessageUnsafeSupplier.get();
			}
			catch (RuntimeException runtimeException) {
				throw runtimeException;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		};
	}

	@GraphQLField
	@JsonProperty(access = JsonProperty.Access.READ_WRITE)
	protected String errorMessage;

	@JsonIgnore
	private Supplier<String> _errorMessageSupplier;

	@io.swagger.v3.oas.annotations.media.Schema
	public String getModelId() {
		if (_modelIdSupplier != null) {
			modelId = _modelIdSupplier.get();

			_modelIdSupplier = null;
		}

		return modelId;
	}

	public void setModelId(String modelId) {
		this.modelId = modelId;

		_modelIdSupplier = null;
	}

	@JsonIgnore
	public void setModelId(
		UnsafeSupplier<String, Exception> modelIdUnsafeSupplier) {

		_modelIdSupplier = () -> {
			try {
				return modelIdUnsafeSupplier.get();
			}
			catch (RuntimeException runtimeException) {
				throw runtimeException;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		};
	}

	@GraphQLField
	@JsonProperty(access = JsonProperty.Access.READ_WRITE)
	protected String modelId;

	@JsonIgnore
	private Supplier<String> _modelIdSupplier;

	@io.swagger.v3.oas.annotations.media.Schema
	public Long getResponseTime() {
		if (_responseTimeSupplier != null) {
			responseTime = _responseTimeSupplier.get();

			_responseTimeSupplier = null;
		}

		return responseTime;
	}

	public void setResponseTime(Long responseTime) {
		this.responseTime = responseTime;

		_responseTimeSupplier = null;
	}

	@JsonIgnore
	public void setResponseTime(
		UnsafeSupplier<Long, Exception> responseTimeUnsafeSupplier) {

		_responseTimeSupplier = () -> {
			try {
				return responseTimeUnsafeSupplier.get();
			}
			catch (RuntimeException runtimeException) {
				throw runtimeException;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		};
	}

	@GraphQLField
	@JsonProperty(access = JsonProperty.Access.READ_WRITE)
	protected Long responseTime;

	@JsonIgnore
	private Supplier<Long> _responseTimeSupplier;

	@Override
	public boolean equals(Object object) {
		if (this == object) {
			return true;
		}

		if (!(object instanceof InferenceEndpointTestResult)) {
			return false;
		}

		InferenceEndpointTestResult inferenceEndpointTestResult =
			(InferenceEndpointTestResult)object;

		return Objects.equals(
			toString(), inferenceEndpointTestResult.toString());
	}

	@Override
	public int hashCode() {
		String string = toString();

		return string.hashCode();
	}

	public String toString() {
		StringBundler sb = new StringBundler();

		sb.append("{");

		Integer dimensions = getDimensions();

		if (dimensions != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"dimensions\": ");

			sb.append(dimensions);
		}

		String errorMessage = getErrorMessage();

		if (errorMessage != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"errorMessage\": ");

			sb.append("\"");

			sb.append(_escape(errorMessage));

			sb.append("\"");
		}

		String modelId = getModelId();

		if (modelId != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"modelId\": ");

			sb.append("\"");

			sb.append(_escape(modelId));

			sb.append("\"");
		}

		Long responseTime = getResponseTime();

		if (responseTime != null) {
			if (sb.length() > 1) {
				sb.append(", ");
			}

			sb.append("\"responseTime\": ");

			sb.append(responseTime);
		}

		sb.append("}");

		return sb.toString();
	}

	@io.swagger.v3.oas.annotations.media.Schema(
		accessMode = io.swagger.v3.oas.annotations.media.Schema.AccessMode.READ_ONLY,
		defaultValue = "com.liferay.portal.search.rest.dto.v1_0.InferenceEndpointTestResult",
		name = "x-class-name"
	)
	public String xClassName;

	private static String _escape(Object object) {
		return StringUtil.replace(
			String.valueOf(object), _JSON_ESCAPE_STRINGS[0],
			_JSON_ESCAPE_STRINGS[1]);
	}

	private static boolean _isArray(Object value) {
		if (value == null) {
			return false;
		}

		Class<?> clazz = value.getClass();

		return clazz.isArray();
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
			sb.append(_escape(entry.getKey()));
			sb.append("\": ");

			Object value = entry.getValue();

			if (_isArray(value)) {
				sb.append("[");

				Object[] valueArray = (Object[])value;

				for (int i = 0; i < valueArray.length; i++) {
					if (valueArray[i] instanceof Map) {
						sb.append(_toJSON((Map<String, ?>)valueArray[i]));
					}
					else if (valueArray[i] instanceof String) {
						sb.append("\"");
						sb.append(valueArray[i]);
						sb.append("\"");
					}
					else {
						sb.append(valueArray[i]);
					}

					if ((i + 1) < valueArray.length) {
						sb.append(", ");
					}
				}

				sb.append("]");
			}
			else if (value instanceof Map) {
				sb.append(_toJSON((Map<String, ?>)value));
			}
			else if (value instanceof String) {
				sb.append("\"");
				sb.append(_escape(value));
				sb.append("\"");
			}
			else {
				sb.append(value);
			}

			if (iterator.hasNext()) {
				sb.append(", ");
			}
		}

		sb.append("}");

		return sb.toString();
	}

	private static final String[][] _JSON_ESCAPE_STRINGS = {
		{"\\", "\"", "\b", "\f", "\n", "\r", "\t"},
		{"\\\\", "\\\"", "\\b", "\\f", "\\n", "\\r", "\\t"}
	};

	private Map<String, Serializable> _extendedProperties;

}
// LIFERAY-REST-BUILDER-HASH:1329122076