/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.rest.internal.resource.v1_0;

import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.module.service.Snapshot;
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.search.rest.dto.v1_0.InferenceEndpointTestResult;
import com.liferay.portal.search.semantic.InferenceEndpointMetadata;
import com.liferay.portal.search.semantic.InferenceEndpointMetadataResolver;
import com.liferay.portal.search.semantic.InferenceEndpointTester;
import com.liferay.portal.search.semantic.InferenceIdResolver;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import jakarta.ws.rs.NotFoundException;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * @author Rodrigo Guedes de Souza
 */
public class InferenceEndpointTestResultResourceImplTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Before
	public void setUp() {
		_inferenceEndpointTestResultResourceImpl =
			new InferenceEndpointTestResultResourceImpl();

		ReflectionTestUtil.setFieldValue(
			InferenceEndpointTestResultResourceImpl.class,
			"_inferenceEndpointMetadataResolverSnapshot",
			_inferenceEndpointMetadataResolverSnapshot);
		ReflectionTestUtil.setFieldValue(
			InferenceEndpointTestResultResourceImpl.class,
			"_inferenceEndpointTesterSnapshot",
			_inferenceEndpointTesterSnapshot);
		ReflectionTestUtil.setFieldValue(
			_inferenceEndpointTestResultResourceImpl, "_inferenceIdResolver",
			_inferenceIdResolver);

		Mockito.when(
			_inferenceEndpointMetadataResolverSnapshot.get()
		).thenReturn(
			_inferenceEndpointMetadataResolver
		);

		Mockito.when(
			_inferenceEndpointTesterSnapshot.get()
		).thenReturn(
			_inferenceEndpointTester
		);

		Mockito.when(
			_company.getCompanyId()
		).thenReturn(
			_COMPANY_ID
		);

		_inferenceEndpointTestResultResourceImpl.contextCompany = _company;

		_setUpFeatureFlagManagerUtil(true);
	}

	@After
	public void tearDown() {
		_featureFlagManagerUtilMockedStatic.close();
	}

	@Test
	public void testPostInferenceEndpointTest() throws Exception {
		Mockito.when(
			_inferenceIdResolver.resolveInferenceId(_COMPANY_ID)
		).thenReturn(
			_INFERENCE_ID
		);

		Mockito.when(
			_inferenceEndpointTester.test(
				_INFERENCE_ID, "Liferay Semantic Search test")
		).thenReturn(
			3072
		);

		Mockito.when(
			_inferenceEndpointMetadataResolver.resolveInferenceEndpointMetadata(
				_INFERENCE_ID)
		).thenReturn(
			new InferenceEndpointMetadata(
				3072, "text-embedding-3-large", "openai")
		);

		InferenceEndpointTestResult inferenceEndpointTestResult =
			_inferenceEndpointTestResultResourceImpl.
				postInferenceEndpointTest();

		Assert.assertEquals(
			Integer.valueOf(3072), inferenceEndpointTestResult.getDimensions());
		Assert.assertNull(inferenceEndpointTestResult.getErrorMessage());
		Assert.assertEquals(
			"text-embedding-3-large", inferenceEndpointTestResult.getModelId());
		Assert.assertNotNull(inferenceEndpointTestResult.getResponseTime());
	}

	@Test
	public void testPostInferenceEndpointTestFeatureFlagDisabled() {
		_setUpFeatureFlagManagerUtil(false);

		try {
			_inferenceEndpointTestResultResourceImpl.
				postInferenceEndpointTest();

			Assert.fail();
		}
		catch (Exception exception) {
			Assert.assertTrue(exception instanceof NotFoundException);
		}
	}

	@Test
	public void testPostInferenceEndpointTestWithoutInferenceEndpointTester()
		throws Exception {

		Mockito.when(
			_inferenceEndpointTesterSnapshot.get()
		).thenReturn(
			null
		);

		InferenceEndpointTestResult inferenceEndpointTestResult =
			_inferenceEndpointTestResultResourceImpl.
				postInferenceEndpointTest();

		Assert.assertNull(inferenceEndpointTestResult.getDimensions());
		Assert.assertEquals(
			"Inference endpoints are only supported when the search engine " +
				"is Elasticsearch.",
			inferenceEndpointTestResult.getErrorMessage());

		Mockito.verifyNoInteractions(_inferenceIdResolver);
	}

	@Test
	public void testPostInferenceEndpointTestWithoutResolvableMetadata()
		throws Exception {

		Mockito.when(
			_inferenceIdResolver.resolveInferenceId(_COMPANY_ID)
		).thenReturn(
			_INFERENCE_ID
		);

		Mockito.when(
			_inferenceEndpointTester.test(
				_INFERENCE_ID, "Liferay Semantic Search test")
		).thenReturn(
			3072
		);

		Mockito.when(
			_inferenceEndpointMetadataResolver.resolveInferenceEndpointMetadata(
				_INFERENCE_ID)
		).thenThrow(
			new RuntimeException()
		);

		InferenceEndpointTestResult inferenceEndpointTestResult =
			_inferenceEndpointTestResultResourceImpl.
				postInferenceEndpointTest();

		Assert.assertEquals(
			Integer.valueOf(3072), inferenceEndpointTestResult.getDimensions());
		Assert.assertNull(inferenceEndpointTestResult.getErrorMessage());
		Assert.assertNull(inferenceEndpointTestResult.getModelId());
		Assert.assertNotNull(inferenceEndpointTestResult.getResponseTime());
	}

	@Test
	public void testPostInferenceEndpointTestWithoutResolvedInferenceId()
		throws Exception {

		Mockito.when(
			_inferenceIdResolver.resolveInferenceId(_COMPANY_ID)
		).thenReturn(
			null
		);

		InferenceEndpointTestResult inferenceEndpointTestResult =
			_inferenceEndpointTestResultResourceImpl.
				postInferenceEndpointTest();

		Assert.assertNull(inferenceEndpointTestResult.getDimensions());
		Assert.assertEquals(
			StringBundler.concat(
				"There is no active Elasticsearch inference endpoint ",
				"configured. Select the \"Elasticsearch Inference Endpoint\" ",
				"text embedding provider and save the configuration first."),
			inferenceEndpointTestResult.getErrorMessage());

		Mockito.verifyNoInteractions(_inferenceEndpointTester);
	}

	@Test
	public void testPostInferenceEndpointTestWrapsTesterException()
		throws Exception {

		Mockito.when(
			_inferenceIdResolver.resolveInferenceId(_COMPANY_ID)
		).thenReturn(
			_INFERENCE_ID
		);

		String message =
			"Unable to test inference endpoint \"liferay-active-provider\"";

		Mockito.when(
			_inferenceEndpointTester.test(
				_INFERENCE_ID, "Liferay Semantic Search test")
		).thenThrow(
			new RuntimeException(message)
		);

		InferenceEndpointTestResult inferenceEndpointTestResult =
			_inferenceEndpointTestResultResourceImpl.
				postInferenceEndpointTest();

		Assert.assertNull(inferenceEndpointTestResult.getDimensions());
		Assert.assertEquals(
			message, inferenceEndpointTestResult.getErrorMessage());
	}

	private void _setUpFeatureFlagManagerUtil(boolean enabled) {
		_featureFlagManagerUtilMockedStatic.when(
			() -> FeatureFlagManagerUtil.isEnabled(_COMPANY_ID, "LPD-11319")
		).thenReturn(
			enabled
		);
	}

	private static final long _COMPANY_ID = 12345;

	private static final String _INFERENCE_ID = "liferay-active-provider";

	private final Company _company = Mockito.mock(Company.class);
	private final MockedStatic<FeatureFlagManagerUtil>
		_featureFlagManagerUtilMockedStatic = Mockito.mockStatic(
			FeatureFlagManagerUtil.class);
	private final InferenceEndpointMetadataResolver
		_inferenceEndpointMetadataResolver = Mockito.mock(
			InferenceEndpointMetadataResolver.class);
	private final Snapshot<InferenceEndpointMetadataResolver>
		_inferenceEndpointMetadataResolverSnapshot = Mockito.mock(
			Snapshot.class);
	private final InferenceEndpointTester _inferenceEndpointTester =
		Mockito.mock(InferenceEndpointTester.class);
	private final Snapshot<InferenceEndpointTester>
		_inferenceEndpointTesterSnapshot = Mockito.mock(Snapshot.class);
	private InferenceEndpointTestResultResourceImpl
		_inferenceEndpointTestResultResourceImpl;
	private final InferenceIdResolver _inferenceIdResolver = Mockito.mock(
		InferenceIdResolver.class);

}