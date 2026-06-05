/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.rest.client.dto.v1_0;

import com.liferay.portal.search.rest.client.function.UnsafeSupplier;
import com.liferay.portal.search.rest.client.serdes.v1_0.InferenceEndpointTestResultSerDes;

import jakarta.annotation.Generated;

import java.io.Serializable;

import java.util.Objects;

/**
 * @author Petteri Karttunen
 * @generated
 */
@Generated("")
public class InferenceEndpointTestResult implements Cloneable, Serializable {

	public static InferenceEndpointTestResult toDTO(String json) {
		return InferenceEndpointTestResultSerDes.toDTO(json);
	}

	public Integer getDimensions() {
		return dimensions;
	}

	public void setDimensions(Integer dimensions) {
		this.dimensions = dimensions;
	}

	public void setDimensions(
		UnsafeSupplier<Integer, Exception> dimensionsUnsafeSupplier) {

		try {
			dimensions = dimensionsUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected Integer dimensions;

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public void setErrorMessage(
		UnsafeSupplier<String, Exception> errorMessageUnsafeSupplier) {

		try {
			errorMessage = errorMessageUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected String errorMessage;

	public String getModelId() {
		return modelId;
	}

	public void setModelId(String modelId) {
		this.modelId = modelId;
	}

	public void setModelId(
		UnsafeSupplier<String, Exception> modelIdUnsafeSupplier) {

		try {
			modelId = modelIdUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected String modelId;

	public Long getResponseTime() {
		return responseTime;
	}

	public void setResponseTime(Long responseTime) {
		this.responseTime = responseTime;
	}

	public void setResponseTime(
		UnsafeSupplier<Long, Exception> responseTimeUnsafeSupplier) {

		try {
			responseTime = responseTimeUnsafeSupplier.get();
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	protected Long responseTime;

	@Override
	public InferenceEndpointTestResult clone()
		throws CloneNotSupportedException {

		return (InferenceEndpointTestResult)super.clone();
	}

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
		return InferenceEndpointTestResultSerDes.toJSON(this);
	}

}
// LIFERAY-REST-BUILDER-HASH:178399807