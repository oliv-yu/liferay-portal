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

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.filter(filterQuery);
		builder.must(_createMatchQuery());
		builder.should(_createMatchPhraseQuery(50));

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));

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

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(_createMatchQuery());
		builder.mustNot(query);

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));

		Assert.assertEquals(List.of(query), boolQuery.mustNot());
	}

	@Test
	public void testKeepsProximityQueryInMustQueryClauses() {
		Query proximityQuery = _createMatchPhraseQuery(50);

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(proximityQuery);

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));

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

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(matchQuery);
		builder.should(_createMatchPhraseQuery(50), exactPhraseQuery);

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));

		Assert.assertEquals(List.of(matchQuery), boolQuery.must());
		Assert.assertEquals(List.of(exactPhraseQuery), boolQuery.should());
	}

	@Test
	public void testRemovesProximityQueryFromInnerBooleanQuery() {
		Query matchQuery = _createMatchQuery();

		BoolQuery.Builder innerBuilder = new BoolQuery.Builder();

		innerBuilder.must(matchQuery);
		innerBuilder.should(_createMatchPhraseQuery(50));

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.should(new Query(innerBuilder.build()));

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));

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

		BoolQuery.Builder innerBuilder = new BoolQuery.Builder();

		innerBuilder.must(matchQuery);
		innerBuilder.should(_createMatchPhraseQuery(50));

		BoolQuery.Builder middleBuilder = new BoolQuery.Builder();

		middleBuilder.should(new Query(innerBuilder.build()));

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(new Query(middleBuilder.build()));

		BoolQuery boolQuery = _getBoolQuery(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));

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
		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.should(_createMatchPhraseQuery(50));

		Assert.assertNull(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));
	}

	@Test
	public void testReturnsNullForNullQuery() {
		Assert.assertNull(HighlightQueryUtil.getHighlightQuery(null));
	}

	@Test
	public void testReturnsNullWhenOnlyFilterQueryClausesSurvive() {
		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.filter(_createMatchQuery());
		builder.should(_createMatchPhraseQuery(50));

		Assert.assertNull(
			HighlightQueryUtil.getHighlightQuery(new Query(builder.build())));
	}

	private Query _createMatchPhraseQuery(Integer slop) {
		MatchPhraseQuery.Builder builder = new MatchPhraseQuery.Builder();

		builder.field(_FIELD_NAME);
		builder.query(_KEYWORDS);
		builder.slop(slop);

		return new Query(builder.build());
	}

	private Query _createMatchQuery() {
		MatchQuery.Builder builder = new MatchQuery.Builder();

		builder.field(_FIELD_NAME);
		builder.query(FieldValue.of(_KEYWORDS));

		return new Query(builder.build());
	}

	private BoolQuery _getBoolQuery(Query query) {
		Assert.assertTrue(String.valueOf(query), query.isBool());

		return query.bool();
	}

	private static final String _FIELD_NAME = "content_en_US";

	private static final String _KEYWORDS = "solar galaxy";

}