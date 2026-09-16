/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.opensearch2.internal.highlight;

import com.liferay.portal.test.rule.LiferayUnitTestRule;

import java.util.List;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

import org.opensearch.client.opensearch._types.FieldValue;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch._types.query_dsl.MatchPhraseQuery;
import org.opensearch.client.opensearch._types.query_dsl.MatchQuery;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.opensearch.client.opensearch._types.query_dsl.QueryBuilders;

/**
 * @author Olivia Yu
 */
public class HighlightQueryUtilTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testKeepsExactPhraseQuery() {
		Query query = _createMatchPhraseQuery(null);

		Assert.assertSame(query, HighlightQueryUtil.getHighlightQuery(query));
	}

	@Test
	public void testKeepsFilterQueryClauses() {
		Query filterQuery = _createMatchQuery();

		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.filter(filterQuery);
		boolQueryBuilder.must(_createMatchQuery());
		boolQueryBuilder.should(_createMatchPhraseQuery(50));

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));

		Assert.assertEquals(List.of(filterQuery), boolQuery.filter());
		Assert.assertTrue(
			boolQuery.should(
			).toString(),
			boolQuery.should(
			).isEmpty());
	}

	@Test
	public void testKeepsMustNotQueryClauses() {
		Query query = _createMatchQuery();

		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.must(_createMatchQuery());
		boolQueryBuilder.mustNot(query);

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));

		Assert.assertEquals(List.of(query), boolQuery.mustNot());
	}

	@Test
	public void testKeepsProximityQueryInMustQueryClauses() {
		Query proximityQuery = _createMatchPhraseQuery(50);

		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.must(proximityQuery);

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));

		Assert.assertEquals(List.of(proximityQuery), boolQuery.must());
	}

	@Test
	public void testKeepsQueryWithoutProximityQuery() {
		Query query = _createMatchQuery();

		Assert.assertSame(query, HighlightQueryUtil.getHighlightQuery(query));
	}

	@Test
	public void testKeepsStandaloneProximityQuery() {
		Query query = _createMatchPhraseQuery(50);

		Assert.assertSame(query, HighlightQueryUtil.getHighlightQuery(query));
	}

	@Test
	public void testRemovesProximityQueryFromBooleanQuery() {
		Query exactPhraseQuery = _createMatchPhraseQuery(null);
		Query matchQuery = _createMatchQuery();

		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.must(matchQuery);
		boolQueryBuilder.should(_createMatchPhraseQuery(50), exactPhraseQuery);

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));

		Assert.assertEquals(List.of(matchQuery), boolQuery.must());
		Assert.assertEquals(List.of(exactPhraseQuery), boolQuery.should());
	}

	@Test
	public void testRemovesProximityQueryFromInnerBooleanQuery() {
		Query matchQuery = _createMatchQuery();

		BoolQuery.Builder innerBoolQueryBuilder = QueryBuilders.bool();

		innerBoolQueryBuilder.must(matchQuery);
		innerBoolQueryBuilder.should(_createMatchPhraseQuery(50));

		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.should(new Query(innerBoolQueryBuilder.build()));

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));

		List<Query> queries = boolQuery.should();

		BoolQuery innerBoolQuery = _getBoolQuery(queries.get(0));

		Assert.assertEquals(List.of(matchQuery), innerBoolQuery.must());
		Assert.assertTrue(
			innerBoolQuery.should(
			).toString(),
			innerBoolQuery.should(
			).isEmpty());
	}

	@Test
	public void testRemovesProximityQueryFromShouldQueryClausesUnderMust() {
		Query matchQuery = _createMatchQuery();

		BoolQuery.Builder innerBoolQueryBuilder = QueryBuilders.bool();

		innerBoolQueryBuilder.must(matchQuery);
		innerBoolQueryBuilder.should(_createMatchPhraseQuery(50));

		BoolQuery.Builder middleBoolQueryBuilder = QueryBuilders.bool();

		middleBoolQueryBuilder.should(new Query(innerBoolQueryBuilder.build()));

		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.must(new Query(middleBoolQueryBuilder.build()));

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));

		List<Query> queries = boolQuery.must();

		BoolQuery middleBoolQuery = _getBoolQuery(queries.get(0));

		queries = middleBoolQuery.should();

		BoolQuery innerBoolQuery = _getBoolQuery(queries.get(0));

		Assert.assertEquals(List.of(matchQuery), innerBoolQuery.must());
		Assert.assertTrue(
			innerBoolQuery.should(
			).toString(),
			innerBoolQuery.should(
			).isEmpty());
	}

	@Test
	public void testRemovesProximityQueryLeavingNothing() {
		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.should(_createMatchPhraseQuery(50));

		Assert.assertNull(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));
	}

	@Test
	public void testReturnsNullForNullQuery() {
		Assert.assertNull(HighlightQueryUtil.getHighlightQuery(null));
	}

	@Test
	public void testReturnsNullWhenOnlyFilterQueryClausesSurvive() {
		BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

		boolQueryBuilder.filter(_createMatchQuery());
		boolQueryBuilder.should(_createMatchPhraseQuery(50));

		Assert.assertNull(
			HighlightQueryUtil.getHighlightQuery(
				new Query(boolQueryBuilder.build())));
	}

	private Query _createMatchPhraseQuery(Integer slop) {
		MatchPhraseQuery.Builder matchPhraseQueryBuilder =
			new MatchPhraseQuery.Builder();

		matchPhraseQueryBuilder.field(_FIELD_NAME);
		matchPhraseQueryBuilder.query(_KEYWORDS);
		matchPhraseQueryBuilder.slop(slop);

		return new Query(matchPhraseQueryBuilder.build());
	}

	private Query _createMatchQuery() {
		MatchQuery.Builder matchQueryBuilder = new MatchQuery.Builder();

		matchQueryBuilder.field(_FIELD_NAME);
		matchQueryBuilder.query(FieldValue.of(_KEYWORDS));

		return new Query(matchQueryBuilder.build());
	}

	private BoolQuery _getBoolQuery(Query query) {
		Assert.assertTrue(String.valueOf(query), query.isBool());

		return query.bool();
	}

	private static final String _FIELD_NAME = "content_en_US";

	private static final String _KEYWORDS = "solar galaxy";

}