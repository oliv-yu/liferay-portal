/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.elasticsearch8.internal.highlight;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhraseQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;

import com.liferay.portal.test.rule.LiferayUnitTestRule;

import java.util.List;

import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

/**
 * @author Olivia Yu
 */
public class HighlightQueryFactoryTest {

	@ClassRule
	@Rule
	public static final LiferayUnitTestRule liferayUnitTestRule =
		LiferayUnitTestRule.INSTANCE;

	@Test
	public void testKeepsExactPhraseQuery() {
		Query query = _matchPhrase(null);

		Assert.assertSame(query, HighlightQueryFactory.create(query));
	}

	@Test
	public void testKeepsFilterQueryClauses() {
		Query filterQuery = _match();

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.filter(filterQuery);
		builder.must(_match());
		builder.should(_matchPhrase(50));

		BoolQuery boolQuery = _createBoolQuery(
			HighlightQueryFactory.create(new Query(builder.build())));

		Assert.assertEquals(List.of(filterQuery), boolQuery.filter());
		Assert.assertTrue(
			boolQuery.should(
			).toString(),
			boolQuery.should(
			).isEmpty());
	}

	@Test
	public void testKeepsMustNotQueryClauses() {
		Query query = _match();

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(_match());
		builder.mustNot(query);

		BoolQuery boolQuery = _createBoolQuery(
			HighlightQueryFactory.create(new Query(builder.build())));

		Assert.assertEquals(List.of(query), boolQuery.mustNot());
	}

	@Test
	public void testKeepsProximityQueryInMustQueryClauses() {
		Query proximityQuery = _matchPhrase(50);

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(proximityQuery);

		BoolQuery boolQuery = _createBoolQuery(
			HighlightQueryFactory.create(new Query(builder.build())));

		Assert.assertEquals(List.of(proximityQuery), boolQuery.must());
	}

	@Test
	public void testKeepsQueryWithoutProximityQuery() {
		Query query = _match();

		Assert.assertSame(query, HighlightQueryFactory.create(query));
	}

	@Test
	public void testKeepsStandaloneProximityQuery() {
		Query query = _matchPhrase(50);

		Assert.assertSame(query, HighlightQueryFactory.create(query));
	}

	@Test
	public void testRemovesProximityQueryFromBooleanQuery() {
		Query exactPhraseQuery = _matchPhrase(null);
		Query matchQuery = _match();

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(matchQuery);
		builder.should(_matchPhrase(50), exactPhraseQuery);

		BoolQuery boolQuery = _createBoolQuery(
			HighlightQueryFactory.create(new Query(builder.build())));

		Assert.assertEquals(List.of(matchQuery), boolQuery.must());
		Assert.assertEquals(List.of(exactPhraseQuery), boolQuery.should());
	}

	@Test
	public void testRemovesProximityQueryFromNestedBooleanQuery() {
		Query matchQuery = _match();

		BoolQuery.Builder innerBuilder = new BoolQuery.Builder();

		innerBuilder.must(matchQuery);
		innerBuilder.should(_matchPhrase(50));

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.should(new Query(innerBuilder.build()));

		BoolQuery boolQuery = _createBoolQuery(
			HighlightQueryFactory.create(new Query(builder.build())));

		List<Query> queries = boolQuery.should();

		BoolQuery innerBoolQuery = _createBoolQuery(queries.get(0));

		Assert.assertEquals(List.of(matchQuery), innerBoolQuery.must());
		Assert.assertTrue(
			innerBoolQuery.should(
			).toString(),
			innerBoolQuery.should(
			).isEmpty());
	}

	@Test
	public void testRemovesProximityQueryFromShouldQueryClausesUnderMust() {
		Query matchQuery = _match();

		BoolQuery.Builder innerBuilder = new BoolQuery.Builder();

		innerBuilder.must(matchQuery);
		innerBuilder.should(_matchPhrase(50));

		BoolQuery.Builder middleBuilder = new BoolQuery.Builder();

		middleBuilder.should(new Query(innerBuilder.build()));

		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.must(new Query(middleBuilder.build()));

		BoolQuery boolQuery = _createBoolQuery(
			HighlightQueryFactory.create(new Query(builder.build())));

		List<Query> queries = boolQuery.must();

		BoolQuery middleBoolQuery = _createBoolQuery(queries.get(0));

		queries = middleBoolQuery.should();

		BoolQuery innerBoolQuery = _createBoolQuery(queries.get(0));

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

		builder.should(_matchPhrase(50));

		Assert.assertNull(
			HighlightQueryFactory.create(new Query(builder.build())));
	}

	@Test
	public void testReturnsNullForNullQuery() {
		Assert.assertNull(HighlightQueryFactory.create(null));
	}

	@Test
	public void testReturnsNullWhenOnlyFilterQueryClausesSurvive() {
		BoolQuery.Builder builder = new BoolQuery.Builder();

		builder.filter(_match());
		builder.should(_matchPhrase(50));

		Assert.assertNull(
			HighlightQueryFactory.create(new Query(builder.build())));
	}

	private BoolQuery _createBoolQuery(Query query) {
		Assert.assertTrue(String.valueOf(query), query.isBool());

		return query.bool();
	}

	private Query _match() {
		MatchQuery.Builder builder = new MatchQuery.Builder();

		builder.field(_FIELD_NAME);
		builder.query(_KEYWORDS);

		return new Query(builder.build());
	}

	private Query _matchPhrase(Integer slop) {
		MatchPhraseQuery.Builder builder = new MatchPhraseQuery.Builder();

		builder.field(_FIELD_NAME);
		builder.query(_KEYWORDS);
		builder.slop(slop);

		return new Query(builder.build());
	}

	private static final String _FIELD_NAME = "content_en_US";

	private static final String _KEYWORDS = "solar galaxy";

}