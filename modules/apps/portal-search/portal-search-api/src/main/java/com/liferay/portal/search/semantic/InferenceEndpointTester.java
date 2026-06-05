/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.semantic;

import org.osgi.annotation.versioning.ProviderType;

/**
 * Tests an Elasticsearch inference endpoint by requesting a text embedding
 * for the given input via the {@code POST _inference/text_embedding/<id>}
 * API, returning the dimensions of the embedding that the endpoint produced.
 * A missing endpoint, a provider rejection (e.g., an invalid API key), or an
 * I/O failure aborts with an actionable {@code RuntimeException}.
 *
 * @author Rodrigo Guedes de Souza
 */
@ProviderType
public interface InferenceEndpointTester {

	public int test(String inferenceId, String input);

}