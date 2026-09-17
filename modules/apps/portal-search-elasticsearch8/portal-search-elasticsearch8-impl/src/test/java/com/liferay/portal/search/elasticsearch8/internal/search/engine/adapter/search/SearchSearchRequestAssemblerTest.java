/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.elasticsearch8.internal.search.engine.adapter.search;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhraseQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.search.Highlight;

import com.liferay.portal.kernel.search.BooleanClauseOccur;
import com.liferay.portal.kernel.search.BooleanQuery;
import com.liferay.portal.kernel.search.MatchQuery;
import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.search.engine.adapter.search.SearchSearchRequest;
import com.liferay.portal.search.internal.highlight.FieldConfigImpl;
import com.liferay.portal.search.internal.highlight.HighlightImpl;
import com.liferay.portal.test.rule.LiferayUnitTestRule;

import java.util.Collections;
import java.util.List;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

/**
 * @author Olivia Yu
 */
public class SearchSearchRequestAssemblerTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testHighlightEnabledCarriesHighlightQuery() {
		SearchSearchRequest searchSearchRequest = _createSearchSearchRequest();

		searchSearchRequest.setHighlightEnabled(true);
		searchSearchRequest.setHighlightFieldNames(_FIELD_NAME);

		Highlight highlight = _assemble(searchSearchRequest);

		_assertHighlightQuery(highlight);
	}

	@Test
	public void testHighlightObjectCarriesHighlightQuery() {
		SearchSearchRequest searchSearchRequest = _createSearchSearchRequest();

		HighlightImpl.HighlightBuilderImpl highlightBuilderImpl =
			new HighlightImpl.HighlightBuilderImpl();

		FieldConfigImpl.FieldConfigBuilderImpl fieldConfigBuilderImpl =
			new FieldConfigImpl.FieldConfigBuilderImpl(_FIELD_NAME);

		searchSearchRequest.setHighlight(
			highlightBuilderImpl.fieldConfigs(
				Collections.singletonList(fieldConfigBuilderImpl.build())
			).build());

		Highlight highlight = _assemble(searchSearchRequest);

		_assertHighlightQuery(highlight);
	}

	private Highlight _assemble(SearchSearchRequest searchSearchRequest) {
		SearchRequest.Builder searchRequestBuilder =
			new SearchRequest.Builder();

		SearchSearchRequestAssembler.INSTANCE.assemble(
			searchRequestBuilder, searchSearchRequest);

		SearchRequest searchRequest = searchRequestBuilder.build();

		return searchRequest.highlight();
	}

	private void _assertHighlightQuery(Highlight highlight) {
		Assert.assertNotNull("No highlight was assembled", highlight);

		Query query = highlight.highlightQuery();

		Assert.assertNotNull("No highlight query was assembled", query);
		Assert.assertEquals(
			String.valueOf(query), 0, _countProximityQueries(query));
		Assert.assertTrue(String.valueOf(query), _countMatchQueries(query) > 0);
	}

	private int _countMatchQueries(Query query) {
		if (query.isMatch()) {
			return 1;
		}

		if (!query.isBool()) {
			return 0;
		}

		BoolQuery boolQuery = query.bool();
		int count = 0;

		for (Query clauseQuery : _getClauses(boolQuery)) {
			count += _countMatchQueries(clauseQuery);
		}

		return count;
	}

	private int _countProximityQueries(Query query) {
		if (query.isMatchPhrase()) {
			MatchPhraseQuery matchPhraseQuery = query.matchPhrase();

			if (matchPhraseQuery.slop() != null) {
				return 1;
			}

			return 0;
		}

		if (!query.isBool()) {
			return 0;
		}

		BoolQuery boolQuery = query.bool();
		int count = 0;

		for (Query clauseQuery : _getClauses(boolQuery)) {
			count += _countProximityQueries(clauseQuery);
		}

		return count;
	}

	private BooleanQuery _createBooleanQuery() {
		BooleanQuery booleanQuery = new BooleanQuery();

		booleanQuery.add(
			new MatchQuery(_FIELD_NAME, _KEYWORDS), BooleanClauseOccur.MUST);

		MatchQuery matchQuery = new MatchQuery(_FIELD_NAME, _KEYWORDS);

		matchQuery.setSlop(50);
		matchQuery.setType(MatchQuery.Type.PHRASE);

		booleanQuery.add(matchQuery, BooleanClauseOccur.SHOULD);

		return booleanQuery;
	}

	private SearchSearchRequest _createSearchSearchRequest() {
		SearchSearchRequest searchSearchRequest = new SearchSearchRequest();

		searchSearchRequest.setIndexNames(_INDEX_NAME);
		searchSearchRequest.setQuery(_createBooleanQuery());

		return searchSearchRequest;
	}

	private List<Query> _getClauses(BoolQuery boolQuery) {
		return ListUtil.concat(
			boolQuery.filter(), boolQuery.must(), boolQuery.mustNot(),
			boolQuery.should());
	}

	private static final String _FIELD_NAME = "content_en_US";

	private static final String _INDEX_NAME = "test-index";

	private static final String _KEYWORDS = "solar galaxy";

}