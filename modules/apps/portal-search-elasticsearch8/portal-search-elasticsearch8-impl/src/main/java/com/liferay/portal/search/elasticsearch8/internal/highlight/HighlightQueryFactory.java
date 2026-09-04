/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.portal.search.elasticsearch8.internal.highlight;

import com.liferay.portal.kernel.util.ListUtil;
import com.liferay.portal.search.query.BooleanQuery;
import com.liferay.portal.search.query.MatchPhraseQuery;
import com.liferay.portal.search.query.QueriesUtil;
import com.liferay.portal.search.query.Query;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * Derives the query that highlights a search response from the query that
 * matched it.
 *
 * <p>
 * Field query builders add a proximity clause, a phrase query carrying a slop,
 * to rank documents whose terms sit close together. That clause exists for
 * scoring alone, but a highlighter given no dedicated query highlights from the
 * whole matching query, and so marks the entire span between the first and the
 * last term. Dropping the proximity clauses leaves the terms and the exact
 * phrases, which are the matches worth marking.
 * </p>
 *
 * @author Olivia Yu
 */
public class HighlightQueryFactory {

	public static Query create(Query query) {
		if (query == null) {
			return null;
		}

		return _removeProximityQueries(query);
	}

	private static void _addQueryClauses(
		Consumer<Query[]> consumer, List<Query> queries) {

		Query[] newQueries = _removeProximityQueries(queries);

		if (newQueries != null) {
			consumer.accept(newQueries);
		}
	}

	private static Query _removeProximityQueries(Query query) {
		if (query instanceof MatchPhraseQuery) {
			MatchPhraseQuery matchPhraseQuery = (MatchPhraseQuery)query;

			if (matchPhraseQuery.getSlop() != null) {
				return null;
			}

			return query;
		}

		if (!(query instanceof BooleanQuery)) {
			return query;
		}

		BooleanQuery booleanQuery = (BooleanQuery)query;

		BooleanQuery newBooleanQuery = QueriesUtil.booleanQuery();

		_addQueryClauses(
			newBooleanQuery::addFilterQueryClauses,
			booleanQuery.getFilterQueryClauses());
		_addQueryClauses(
			newBooleanQuery::addMustQueryClauses,
			booleanQuery.getMustQueryClauses());
		_addQueryClauses(
			newBooleanQuery::addMustNotQueryClauses,
			booleanQuery.getMustNotQueryClauses());
		_addQueryClauses(
			newBooleanQuery::addShouldQueryClauses,
			booleanQuery.getShouldQueryClauses());

		if (!newBooleanQuery.hasClauses()) {
			return null;
		}

		return newBooleanQuery;
	}

	private static Query[] _removeProximityQueries(List<Query> queries) {
		if (ListUtil.isEmpty(queries)) {
			return null;
		}

		List<Query> newQueries = new ArrayList<>(queries.size());

		for (Query query : queries) {
			Query newQuery = _removeProximityQueries(query);

			if (newQuery != null) {
				newQueries.add(newQuery);
			}
		}

		if (ListUtil.isEmpty(newQueries)) {
			return null;
		}

		return newQueries.toArray(new Query[0]);
	}

}
