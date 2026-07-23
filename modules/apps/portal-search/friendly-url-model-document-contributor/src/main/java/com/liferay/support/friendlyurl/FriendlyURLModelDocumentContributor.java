/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.support.friendlyurl;

import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.search.Document;
import com.liferay.portal.search.spi.model.index.contributor.ModelDocumentContributor;

import org.osgi.service.component.annotations.Component;

/**
 * Adds a "friendlyURLText" custom field to every Layout's search document.
 *
 * <p>
 * This reproduces the customization behind LPP-64901. The field is added with
 * {@link Document#addText(String, String)}, which maps to an analyzed
 * Elasticsearch <code>text</code> field. Because <code>text</code> fields have
 * fielddata disabled by default, any Search Blueprint element that sorts,
 * aggregates, or exact-filters on <code>friendlyURLText</code> triggers a
 * <code>search_phase_execution_exception</code>. The fix is to use
 * {@link Document#addKeyword(String, String)} instead.
 * </p>
 *
 * @author Olivia Yu
 */
@Component(
	property = "indexer.class.name=com.liferay.portal.kernel.model.Layout",
	service = ModelDocumentContributor.class
)
public class FriendlyURLModelDocumentContributor
	implements ModelDocumentContributor<Layout> {

	@Override
	public void contribute(Document document, Layout layout) {
		String friendlyURL = layout.getFriendlyURL();

		if (friendlyURL == null) {
			return;
		}

		String value = friendlyURL.replace("/", " ").replace("-", " ");

		document.addKeyword("friendlyURLText", value.trim());
	}

}
