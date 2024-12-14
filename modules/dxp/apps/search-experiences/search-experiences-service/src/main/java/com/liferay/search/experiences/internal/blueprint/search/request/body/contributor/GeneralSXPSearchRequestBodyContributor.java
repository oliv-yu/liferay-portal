/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.search.experiences.internal.blueprint.search.request.body.contributor;

import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.TimeZoneUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.search.searcher.SearchRequestBuilder;
import com.liferay.search.experiences.internal.blueprint.parameter.SXPParameterData;
import com.liferay.search.experiences.rest.dto.v1_0.Configuration;
import com.liferay.search.experiences.rest.dto.v1_0.GeneralConfiguration;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author André de Oliveira
 */
public class GeneralSXPSearchRequestBodyContributor
	implements SXPSearchRequestBodyContributor {

	@Override
	public void contribute(
		Configuration configuration, SearchRequestBuilder searchRequestBuilder,
		SXPParameterData sxpParameterData) {

		GeneralConfiguration generalConfiguration =
			configuration.getGeneralConfiguration();

		if (generalConfiguration == null) {
			return;
		}

		if (ArrayUtil.isNotEmpty(
				generalConfiguration.getClauseContributorsExcludes())) {

			searchRequestBuilder.withSearchContext(
				searchContext -> searchContext.setAttribute(
					"search.full.query.clause.contributors.excludes",
					StringUtil.merge(
						generalConfiguration.getClauseContributorsExcludes())));
		}

		if (ArrayUtil.isNotEmpty(
				generalConfiguration.getClauseContributorsIncludes())) {

			searchRequestBuilder.withSearchContext(
				searchContext -> searchContext.setAttribute(
					"search.full.query.clause.contributors.includes",
					StringUtil.merge(
						generalConfiguration.getClauseContributorsIncludes())));
		}

		if (generalConfiguration.getEmptySearchEnabled() != null) {
			searchRequestBuilder.emptySearchEnabled(
				generalConfiguration.getEmptySearchEnabled());
		}

		if (generalConfiguration.getExplain() != null) {
			searchRequestBuilder.explain(generalConfiguration.getExplain());
		}

		if (generalConfiguration.getIncludeResponseString() != null) {
			searchRequestBuilder.includeResponseString(
				generalConfiguration.getIncludeResponseString());
		}

		if (!Validator.isBlank(generalConfiguration.getQueryString())) {
			searchRequestBuilder.queryString(
				generalConfiguration.getQueryString());
		}

		if (ArrayUtil.isNotEmpty(
				generalConfiguration.getSearchableAssetTypes())) {

			String[] searchableAssetTypes = Arrays.stream(
				generalConfiguration.getSearchableAssetTypes()
			).map(
				assetType -> {
					String[] assetTypeName = StringUtil.split(
						assetType, StringPool.POUND);

					return assetTypeName[0];
				}
			).distinct(
			).toArray(
				String[]::new
			);

			searchRequestBuilder.entryClassNames(searchableAssetTypes);
			searchRequestBuilder.modelIndexerClassNames(searchableAssetTypes);

			HashMap<String, List<String[]>> searchableAssetSubtypeHashMap =
				Arrays.stream(
					generalConfiguration.getSearchableAssetTypes()
				).map(
					assetType -> StringUtil.split(assetType, StringPool.POUND)
				).filter(
					assetTypeArray -> assetTypeArray.length > 1
				).collect(
					Collectors.groupingBy(
						assetTypeArray -> assetTypeArray[0], HashMap::new,
						Collectors.mapping(
							assetTypeArray -> assetTypeArray,
							Collectors.toList()))
				);

			searchRequestBuilder.withSearchContext(
				searchContext -> searchContext.setAttribute(
					"searchableAssetSubtypesMap",
					searchableAssetSubtypeHashMap));

			//			Map<String, LinkedList<String[]>> searchableAssetSubtypeMap =
//				new HashMap<>();
//
//			for (String searchableAssetSubtype :
//					generalConfiguration.getSearchableAssetTypes()) {
//
//				String[] searchableSubtypeIdentifier = StringUtil.split(
//					searchableAssetSubtype, StringPool.POUND);
//
//				if (searchableSubtypeIdentifier.length <= 1) {
//					continue;
//				}
//
//				String searchableAssetType = searchableSubtypeIdentifier[0];
//
//				if (searchableAssetSubtypeMap.containsKey(
//						searchableAssetType)) {
//
//					LinkedList<String[]> searchableAssetSubtypeIdentifiers =
//						searchableAssetSubtypeMap.get(searchableAssetType);
//
//					searchableAssetSubtypeIdentifiers.add(
//						searchableSubtypeIdentifier);
//				}
//				else {
//					List<String[]> searchableAssetSubtypeIdentifiers =
//						new LinkedList<>();
//
//					searchableAssetSubtypeIdentifiers.add(
//						searchableSubtypeIdentifier);
//
//					searchableAssetSubtypeMap.put(
//						searchableAssetType, searchableAssetSubtypeIdentifiers);
//				}
//			}
//
//			searchRequestBuilder.withSearchContext(
//				searchContext -> searchContext.setAttribute(
//					"searchableAssetSubtypesMap", searchableAssetSubtypeMap));
		}

		if (!Validator.isBlank(generalConfiguration.getLanguageId())) {
			searchRequestBuilder.locale(
				LocaleUtil.fromLanguageId(
					generalConfiguration.getLanguageId()));
		}

		if (!Validator.isBlank(generalConfiguration.getTimeZoneId())) {
			searchRequestBuilder.withSearchContext(
				searchContext -> searchContext.setTimeZone(
					TimeZoneUtil.getTimeZone(
						generalConfiguration.getTimeZoneId())));
		}
	}

	@Override
	public String getName() {
		return "generalConfiguration";
	}

}