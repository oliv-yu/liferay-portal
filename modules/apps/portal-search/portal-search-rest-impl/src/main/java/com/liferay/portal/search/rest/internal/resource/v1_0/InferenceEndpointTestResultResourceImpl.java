/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.rest.internal.resource.v1_0;

import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.module.service.Snapshot;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.PermissionThreadLocal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.search.rest.dto.v1_0.InferenceEndpointTestResult;
import com.liferay.portal.search.rest.resource.v1_0.InferenceEndpointTestResultResource;
import com.liferay.portal.search.semantic.InferenceEndpointMetadata;
import com.liferay.portal.search.semantic.InferenceEndpointMetadataResolver;
import com.liferay.portal.search.semantic.InferenceEndpointTester;
import com.liferay.portal.search.semantic.InferenceIdResolver;
import com.liferay.portal.search.semantic.TextEmbeddingProviderNames;

import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ServiceScope;

/**
 * @author Petteri Karttunen
 */
@Component(
	properties = "OSGI-INF/liferay/rest/v1_0/inference-endpoint-test-result.properties",
	scope = ServiceScope.PROTOTYPE,
	service = InferenceEndpointTestResultResource.class
)
public class InferenceEndpointTestResultResourceImpl
	extends BaseInferenceEndpointTestResultResourceImpl {

	@Override
	public InferenceEndpointTestResult postInferenceEndpointTest()
		throws Exception {

		if (!FeatureFlagManagerUtil.isEnabled(
				contextCompany.getCompanyId(), "LPD-11319")) {

			throw new NotFoundException();
		}

		_checkPermission();

		InferenceEndpointMetadataResolver inferenceEndpointMetadataResolver =
			_inferenceEndpointMetadataResolverSnapshot.get();
		InferenceEndpointTester inferenceEndpointTester =
			_inferenceEndpointTesterSnapshot.get();

		if ((inferenceEndpointMetadataResolver == null) ||
			(inferenceEndpointTester == null)) {

			return new InferenceEndpointTestResult() {
				{
					setErrorMessage(
						() ->
							"Inference endpoints are only supported when the " +
								"search engine is Elasticsearch.");
				}
			};
		}

		String inferenceId = _inferenceIdResolver.resolveInferenceId(
			contextCompany.getCompanyId());

		if (Validator.isBlank(inferenceId)) {
			return new InferenceEndpointTestResult() {
				{
					setErrorMessage(
						() -> StringBundler.concat(
							"There is no active Elasticsearch inference ",
							"endpoint configured. Select the \"",
							TextEmbeddingProviderNames.
								ELASTICSEARCH_INFERENCE_ENDPOINT,
							"\" text embedding provider and save the ",
							"configuration first."));
				}
			};
		}

		try {
			long startTime = System.currentTimeMillis();

			int embeddingDimensions = inferenceEndpointTester.test(
				inferenceId, _INPUT);

			long elapsedTime = System.currentTimeMillis() - startTime;

			InferenceEndpointMetadata inferenceEndpointMetadata =
				_resolveInferenceEndpointMetadata(
					inferenceEndpointMetadataResolver, inferenceId);

			return new InferenceEndpointTestResult() {
				{

					// The local variable names must not match the inherited
					// field names (e.g., dimensions, responseTime), or the
					// lazy suppliers would capture the inherited null fields
					// instead of the enclosing locals

					setDimensions(() -> embeddingDimensions);

					if (inferenceEndpointMetadata != null) {
						setModelId(inferenceEndpointMetadata::getModelId);
					}

					setResponseTime(() -> elapsedTime);
				}
			};
		}
		catch (Exception exception) {
			return new InferenceEndpointTestResult() {
				{
					setErrorMessage(exception::getMessage);
				}
			};
		}
	}

	private void _checkPermission() {
		PermissionChecker permissionChecker =
			PermissionThreadLocal.getPermissionChecker();

		if (!permissionChecker.isCompanyAdmin() &&
			!permissionChecker.isOmniadmin()) {

			throw new NotAuthorizedException(Response.Status.UNAUTHORIZED);
		}
	}

	private InferenceEndpointMetadata _resolveInferenceEndpointMetadata(
		InferenceEndpointMetadataResolver inferenceEndpointMetadataResolver,
		String inferenceId) {

		try {
			return inferenceEndpointMetadataResolver.
				resolveInferenceEndpointMetadata(inferenceId);
		}
		catch (Exception exception) {
			if (_log.isWarnEnabled()) {
				_log.warn(
					"Unable to get metadata for inference endpoint \"" +
						inferenceId + "\"",
					exception);
			}

			return null;
		}
	}

	private static final String _INPUT = "Liferay Semantic Search test";

	private static final Log _log = LogFactoryUtil.getLog(
		InferenceEndpointTestResultResourceImpl.class);

	private static final Snapshot<InferenceEndpointMetadataResolver>
		_inferenceEndpointMetadataResolverSnapshot = new Snapshot<>(
			InferenceEndpointTestResultResourceImpl.class,
			InferenceEndpointMetadataResolver.class, null, true);
	private static final Snapshot<InferenceEndpointTester>
		_inferenceEndpointTesterSnapshot = new Snapshot<>(
			InferenceEndpointTestResultResourceImpl.class,
			InferenceEndpointTester.class, null, true);

	@Reference
	private InferenceIdResolver _inferenceIdResolver;

}