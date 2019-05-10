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

package com.liferay.portal.search.ranking.web.internal.portlet.action;

import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.portlet.JSONPortletResponseUtil;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;
import com.liferay.portal.kernel.search.Field;
import com.liferay.portal.kernel.search.SearchContext;
import com.liferay.portal.kernel.util.Constants;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.search.document.Document;
import com.liferay.portal.search.engine.adapter.SearchEngineAdapter;
import com.liferay.portal.search.engine.adapter.document.GetDocumentRequest;
import com.liferay.portal.search.engine.adapter.document.GetDocumentResponse;
import com.liferay.portal.search.legacy.searcher.SearchRequestBuilderFactory;
import com.liferay.portal.search.ranking.web.internal.constants.SearchTuningPortletKeys;
import com.liferay.portal.search.ranking.web.internal.index.Ranking;
import com.liferay.portal.search.ranking.web.internal.index.RankingIndexReader;
import com.liferay.portal.search.searcher.SearchRequest;
import com.liferay.portal.search.searcher.SearchRequestBuilder;
import com.liferay.portal.search.searcher.SearchResponse;
import com.liferay.portal.search.searcher.Searcher;

import java.io.IOException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Bryan Engler
 */
@Component(
	immediate = true,
	property = {
		"javax.portlet.name=" + SearchTuningPortletKeys.SEARCH_TUNING,
		"mvc.command.name=/results_ranking/get_results"
	},
	service = MVCResourceCommand.class
)
public class RankingMVCResourceCommand implements MVCResourceCommand {

	@Override
	public boolean serveResource(
		ResourceRequest resourceRequest, ResourceResponse resourceResponse) {

		String cmd = ParamUtil.getString(resourceRequest, Constants.CMD);

		if (cmd.equals("getVisibleResults")) {
			_writeVisibleDocumentsJSON(resourceRequest, resourceResponse);
		}
		else if (cmd.equals("getHiddenResults")) {
			_writeHiddenDocumentsJSON(resourceRequest, resourceResponse);
		}

		return false;
	}

	protected Document getDocument(String index, String uid, String type) {
		GetDocumentRequest getDocumentRequest = new GetDocumentRequest(
			index, uid);

		getDocumentRequest.setType(type);
		getDocumentRequest.setFetchSourceInclude("*");

		GetDocumentResponse getDocumentResponse = searchEngineAdapter.execute(
			getDocumentRequest);

		if (!getDocumentResponse.isExists()) {
			return null;
		}

		return getDocumentResponse.getDocument();
	}

	protected String getTitle(Document document) {
		String title = document.getString(Field.TITLE + "_en_US");

		if (!Validator.isBlank(title)) {
			return title;
		}

		return document.getString(Field.TITLE);
	}

	protected void populateHiddenDocuments(
		JSONArray jsonArray, Ranking ranking) {

		List<String> hiddenDocumentUids = ranking.getHiddenDocuments();

		if (ListUtil.isNotEmpty(hiddenDocumentUids)) {
			String index = ranking.getIndex();

			for (String hiddenDocumentUid : hiddenDocumentUids) {
				Document hiddenDocument = getDocument(
					index, hiddenDocumentUid,
					LiferayTypeMappingsConstants.LIFERAY_DOCUMENT_TYPE);

				if (hiddenDocument != null) {
					jsonArray.put(_translate(hiddenDocument, false, true));
				}
			}
		}
	}

	protected void populateVisibleDocuments(
		ResourceRequest resourceRequest, JSONArray jsonArray, Ranking ranking) {

		List<String> hiddenUids = ranking.getHiddenDocuments();

		List<Map<String, String>> pinnedDocuments =
			ranking.getPinnedDocuments();

		if (pinnedDocuments != null) {
			List<Document> pinnedDocs = new ArrayList<>(pinnedDocuments.size());

			for (Map<String, String> pinnedDocument : pinnedDocuments) {
				String position = pinnedDocument.get("position");
				String uid = pinnedDocument.get("uid");

				String index = ranking.getIndex();

				Document liferayDocument = getDocument(
					index, uid,
					LiferayTypeMappingsConstants.LIFERAY_DOCUMENT_TYPE);

				pinnedDocs.add(Integer.valueOf(position), liferayDocument);

				hiddenUids.add(uid);
			}

			for (Document document : pinnedDocs) {
				jsonArray.put(_translate(document, true, false));
			}
		}

		Stream<Document> documents = _search(resourceRequest);

		List<Document> filteredDocs =
			documents.filter(
				document -> !hiddenUids.contains(document.getString(Field.UID))
			).collect(
				Collectors.toList()
			);

		for (Document document : filteredDocs) {
			jsonArray.put(_translate(document, false, false));
		}
	}

	protected Stream<Document> _search(ResourceRequest resourceRequest) {
		SearchContext searchContext = new SearchContext();

		long companyId = ParamUtil.getLong(resourceRequest, "companyId");
		String keywords = ParamUtil.getString(resourceRequest, "keywords");
		int from = ParamUtil.getInteger(resourceRequest, "from");
		int size = ParamUtil.getInteger(resourceRequest, "size", 10);

		searchContext.setCompanyId(companyId);
		searchContext.setKeywords(keywords);
		searchContext.setStart(from);
		searchContext.setEnd(from + size);

		SearchRequestBuilder searchRequestBuilder =
			searchRequestBuilderFactory.builder(searchContext);

		SearchRequest searchRequest = searchRequestBuilder.build();

		SearchResponse searchResponse = searcher.search(searchRequest);

		Stream<Document> docs = searchResponse.getDocumentsStream();
		return docs;
	}

	@Reference
	protected RankingIndexReader rankingIndexReader;

	@Reference
	protected SearchEngineAdapter searchEngineAdapter;

	@Reference
	protected Searcher searcher;

	@Reference
	protected SearchRequestBuilderFactory searchRequestBuilderFactory;

	private JSONObject _translate(
		Document document, boolean pinned, boolean hidden) {

		return JSONUtil.put(
			"author", document.getString(Field.USER_NAME)
		).put(
			"clicks", document.getString("clicks")
		).put(
			"description", document.getString(Field.DESCRIPTION)
		).put(
			"hidden", hidden
		).put(
			"id", document.getString(Field.UID)
		).put(
			"pinned", pinned
		).put(
			"title", getTitle(document)
		).put(
			"type", document.getString(Field.ENTRY_CLASS_NAME)
		);
	}

	private void _writeHiddenDocumentsJSON(
		ResourceRequest resourceRequest, ResourceResponse resourceResponse) {

		JSONArray jsonArray = JSONFactoryUtil.createJSONArray();

		String uid = ParamUtil.getString(resourceRequest, "resultsRankingUid");

		Optional<Ranking> optional = rankingIndexReader.fetch(uid);

		if (optional.isPresent()) {
			populateHiddenDocuments(jsonArray, optional.get());
		}

		JSONObject jsonObject = JSONUtil.put(
			"documents", jsonArray
		).put(
			"total", jsonArray.length()
		);

		_writeJSON(resourceRequest, resourceResponse, jsonObject);
	}

	private void _writeJSON(
		ResourceRequest resourceRequest, ResourceResponse resourceResponse,
		JSONObject jsonObject) {

		try {
			JSONPortletResponseUtil.writeJSON(
				resourceRequest, resourceResponse, jsonObject);
		}
		catch (IOException ioe) {
			throw new RuntimeException(ioe);
		}
	}

	private void _writeVisibleDocumentsJSON(
		ResourceRequest resourceRequest, ResourceResponse resourceResponse) {

		JSONArray jsonArray = JSONFactoryUtil.createJSONArray();

		Optional<Ranking> optional = rankingIndexReader.fetch(
			ParamUtil.getString(resourceRequest, "resultsRankingUid"));

		if (optional.isPresent()) {
			populateVisibleDocuments(
				resourceRequest, jsonArray, optional.get());
		}

		JSONObject jsonObject = JSONUtil.put(
			"documents", jsonArray
		).put(
			"total", jsonArray.length()
		);

		_writeJSON(resourceRequest, resourceResponse, jsonObject);
	}

}