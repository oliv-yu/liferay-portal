/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.portal.search.ranking.web.internal.index;

import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.search.document.Document;

import java.util.List;
import java.util.Map;

import org.osgi.service.component.annotations.Component;

/**
 * @author André de Oliveira
 */
@Component(service = DocumentToRankingTranslator.class)
public class DocumentToRankingTranslatorImpl
	implements DocumentToRankingTranslator {

	@Override
	public Ranking translate(Document document, String uid) {
		Ranking ranking = new Ranking();

		ranking.setAliases(
			ArrayUtil.toStringArray(document.getStrings("aliases")));
		ranking.setHiddenDocuments(
			(List<String>)document.getValue("hidden_documents"));
		ranking.setIndex(document.getString("index"));
		ranking.setQueryString(document.getString("keywords"));
		ranking.setPinnedDocuments(
			(List<Map<String, String>>)document.getValue("pinned_documents"));
		ranking.setStatus(GetterUtil.getInteger(document.getInteger("status")));
		ranking.setUid(uid);

		return ranking;
	}

}