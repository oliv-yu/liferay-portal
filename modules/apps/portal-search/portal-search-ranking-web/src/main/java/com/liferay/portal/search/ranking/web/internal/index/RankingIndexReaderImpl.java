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

import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.search.document.Document;
import com.liferay.portal.search.engine.adapter.SearchEngineAdapter;
import com.liferay.portal.search.engine.adapter.document.GetDocumentRequest;
import com.liferay.portal.search.engine.adapter.document.GetDocumentResponse;
import com.liferay.portal.search.engine.adapter.search.SearchSearchRequest;
import com.liferay.portal.search.engine.adapter.search.SearchSearchResponse;
import com.liferay.portal.search.hits.SearchHit;
import com.liferay.portal.search.hits.SearchHits;
import com.liferay.portal.search.query.BooleanQuery;
import com.liferay.portal.search.query.MatchQuery;
import com.liferay.portal.search.query.Queries;
import com.liferay.portal.search.query.TermQuery;
import com.liferay.portal.search.query.TermsQuery;

import java.util.List;
import java.util.Optional;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Bryan Engler
 */
@Component(service = RankingIndexReader.class)
public class RankingIndexReaderImpl implements RankingIndexReader {

	@Override
	public boolean exists(RankingCriteria rankingCriteria) {
		SearchSearchRequest searchSearchRequest = createSearchSearchRequest();

		searchSearchRequest.setQuery(_translate(rankingCriteria));
		searchSearchRequest.setSize(0);

		SearchSearchResponse searchSearchResponse =
			_searchEngineAdapter.execute(searchSearchRequest);

		if (searchSearchResponse.getCount() > 0) {
			return true;
		}

		return false;
	}

	@Override
	public Optional<Ranking> fetch(String id) {
		return Optional.ofNullable(
			_getDocument(id)
		).map(
			document -> translate(document, id)
		);
	}

	@Override
	public Optional<Ranking> fetchByQueryStringOptional(String queryString) {
		if (Validator.isBlank(queryString)) {
			return Optional.empty();
		}

		SearchSearchRequest searchSearchRequest = createSearchSearchRequest();

		searchSearchRequest.setQuery(
			_queries.matchPhrase(
				SearchTuningFields.ALL_QUERY_STRINGS, queryString));

		searchSearchRequest.setSize(1);

		SearchSearchResponse searchSearchResponse =
			_searchEngineAdapter.execute(searchSearchRequest);

		return getFirstRankingOptional(searchSearchResponse);
	}

	protected SearchSearchRequest createSearchSearchRequest() {
		SearchSearchRequest searchSearchRequest = new SearchSearchRequest();

		searchSearchRequest.setIndexNames(_getIndexName());

		return searchSearchRequest;
	}

	protected Optional<Ranking> getFirstRankingOptional(
		SearchSearchResponse searchSearchResponse) {

		if (searchSearchResponse.getCount() == 0) {
			return Optional.empty();
		}

		SearchHit searchHit = getFirstSearchHit(searchSearchResponse);

		return fetch(searchHit.getId());
	}

	protected SearchHit getFirstSearchHit(
		SearchSearchResponse searchSearchResponse) {

		SearchHits searchHits = searchSearchResponse.getSearchHits();

		List<SearchHit> searchHitsList = searchHits.getSearchHits();

		return searchHitsList.get(0);
	}

	protected BooleanQuery getQueryStringQuery(
		RankingCriteria rankingCriteria) {

		BooleanQuery queryStringBooleanQuery = _queries.booleanQuery();

		String keywords = rankingCriteria.getQueryString();

		if (!Validator.isBlank(keywords)) {
			TermQuery aliasesKeywordsTermQuery = _queries.term(
				SearchTuningFields.ALIASES, keywords);

			TermQuery keywordsKeywordsTermQuery = _queries.term(
				SearchTuningFields.QUERY_STRING, keywords);

			queryStringBooleanQuery.addShouldQueryClauses(
				aliasesKeywordsTermQuery, keywordsKeywordsTermQuery);
		}

		return queryStringBooleanQuery;
	}

	@Reference(unbind = "-")
	protected void setQueries(Queries queries) {
		_queries = queries;
	}

	@Reference(unbind = "-")
	protected void setSearchEngineAdapter(
		SearchEngineAdapter searchEngineAdapter) {

		_searchEngineAdapter = searchEngineAdapter;
	}

	protected Ranking translate(Document document, String id) {
		return _documentToRankingTranslator.translate(document, id);
	}

	private Document _getDocument(String id) {
		GetDocumentRequest getDocumentRequest = new GetDocumentRequest(
			_getIndexName(), id);

		getDocumentRequest.setFetchSourceInclude(StringPool.STAR);

		GetDocumentResponse getDocumentResponse = _searchEngineAdapter.execute(
			getDocumentRequest);

		if (getDocumentResponse.isExists()) {
			return getDocumentResponse.getDocument();
		}

		return null;
	}

	private String _getIndexName() {
		return SearchTuningIndexDefinition.INDEX_NAME;
	}

	private BooleanQuery _translate(RankingCriteria rankingCriteria) {
		BooleanQuery booleanQuery = _queries.booleanQuery();

		BooleanQuery queryStringBooleanQuery = getQueryStringQuery(
			rankingCriteria);

		List<String> aliases = rankingCriteria.getAliases();

		if (ListUtil.isNotEmpty(aliases)) {
			TermsQuery aliasesAliasesTermsQuery = _queries.terms(
				SearchTuningFields.ALIASES);

			aliasesAliasesTermsQuery.addValues(aliases.toArray());

			TermsQuery keywordsAliasesTermsQuery = _queries.terms(
				SearchTuningFields.QUERY_STRING);

			keywordsAliasesTermsQuery.addValues(aliases.toArray());

			queryStringBooleanQuery.addShouldQueryClauses(
				aliasesAliasesTermsQuery, keywordsAliasesTermsQuery);
		}

		MatchQuery indexMatchQuery = _queries.match(
			"index", rankingCriteria.getIndex());

		booleanQuery.addMustQueryClauses(
			indexMatchQuery, queryStringBooleanQuery);

		if (rankingCriteria.getId() != null) {
			booleanQuery.addMustNotQueryClauses(
				_queries.match("_id", rankingCriteria.getId()));
		}

		return booleanQuery;
	}

	@Reference
	private DocumentToRankingTranslator _documentToRankingTranslator;

	private Queries _queries;
	private SearchEngineAdapter _searchEngineAdapter;

}