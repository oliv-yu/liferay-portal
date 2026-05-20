/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.asset.list.web.internal.util;

import com.liferay.asset.kernel.AssetRendererFactoryRegistryUtil;
import com.liferay.asset.kernel.model.AssetRendererFactory;
import com.liferay.asset.kernel.model.ClassType;
import com.liferay.asset.kernel.model.ClassTypeField;
import com.liferay.asset.kernel.model.ClassTypeReader;
import com.liferay.dynamic.data.mapping.util.DDMIndexer;
import com.liferay.list.type.model.ListTypeEntry;
import com.liferay.list.type.service.ListTypeEntryLocalServiceUtil;
import com.liferay.object.constants.ObjectFieldConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectField;
import com.liferay.object.service.ObjectDefinitionLocalServiceUtil;
import com.liferay.object.service.ObjectFieldLocalServiceUtil;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.PortalUtil;

import java.util.Locale;

/**
 * @author Joshua Cords
 */
public class AssetListTypePropertiesUtil {

	public static JSONArray getTypePropertiesJSONArray(
		long[] classNameIds, long[] classTypeIds, long companyId,
		DDMIndexer ddmIndexer, Locale locale) {

		JSONArray jsonArray = JSONFactoryUtil.createJSONArray();

		if (!FeatureFlagManagerUtil.isEnabled(companyId, "LPD-74731")) {
			return jsonArray;
		}

		for (int i = 0; i < classNameIds.length; i++) {
			long classTypeId = 0;

			if (i < classTypeIds.length) {
				classTypeId = classTypeIds[i];
			}

			ObjectDefinition objectDefinition = _resolveObjectDefinition(
				classNameIds[i], classTypeId, companyId);

			if (objectDefinition != null) {
				for (ObjectField objectField :
						ObjectFieldLocalServiceUtil.getObjectFields(
							objectDefinition.getObjectDefinitionId())) {

					if (objectField.isMetadata()) {
						continue;
					}

					String type = _toFilterType(objectField.getBusinessType());

					if (type == null) {
						continue;
					}

					jsonArray.put(
						_toPropertyJSONObject(
							classNameIds[i], classTypeId, locale, objectField,
							type));
				}

				continue;
			}

			_addDDMTypeProperties(
				classNameIds[i], classTypeId, ddmIndexer, jsonArray, locale);
		}

		return jsonArray;
	}

	private static void _addDDMTypeProperties(
		long classNameId, long classTypeId, DDMIndexer ddmIndexer,
		JSONArray jsonArray, Locale locale) {

		if ((classTypeId <= 0) || (ddmIndexer == null)) {
			return;
		}

		AssetRendererFactory<?> assetRendererFactory =
			AssetRendererFactoryRegistryUtil.
				getAssetRendererFactoryByClassNameId(classNameId);

		if (assetRendererFactory == null) {
			return;
		}

		ClassTypeReader classTypeReader =
			assetRendererFactory.getClassTypeReader();

		try {
			ClassType classType = classTypeReader.getClassType(
				classTypeId, locale);

			// The encoded name is paired with the ddm__ prefix branch in
			// AssetEntryQuery.checkOrderByCol and
			// AssetHelperImpl._getSearchSort; classNameId and classTypeId are
			// intentionally omitted from the emitted JSON so the React picker
			// writes the encoded name verbatim (see CollectionOrdering's
			// hidden-input render).

			for (ClassTypeField classTypeField :
					classType.getClassTypeFields()) {

				jsonArray.put(
					JSONUtil.put(
						"label", classTypeField.getLabel()
					).put(
						"name",
						ddmIndexer.encodeName(
							classTypeId, classTypeField.getFieldReference(),
							null)
					).put(
						"sortable", true
					).put(
						"type", classTypeField.getType()
					));
			}
		}
		catch (PortalException portalException) {
			if (_log.isDebugEnabled()) {
				_log.debug(portalException);
			}
		}
	}

	private static ObjectDefinition _resolveObjectDefinition(
		long classNameId, long classTypeId, long companyId) {

		if (classTypeId > 0) {
			ObjectDefinition objectDefinition =
				ObjectDefinitionLocalServiceUtil.fetchObjectDefinition(
					classTypeId);

			if (objectDefinition != null) {
				return objectDefinition;
			}
		}

		if (classNameId <= 0) {
			return null;
		}

		return ObjectDefinitionLocalServiceUtil.
			fetchObjectDefinitionByClassName(
				companyId, PortalUtil.getClassName(classNameId));
	}

	private static String _toFilterType(String businessType) {
		if (businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_BOOLEAN)) {
			return "boolean";
		}

		if (businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_DATE)) {
			return "date";
		}

		if (businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_DATE_TIME)) {
			return "date-time";
		}

		if (businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_DECIMAL) ||
			businessType.equals(
				ObjectFieldConstants.BUSINESS_TYPE_PRECISION_DECIMAL)) {

			return "decimal";
		}

		if (businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_INTEGER) ||
			businessType.equals(
				ObjectFieldConstants.BUSINESS_TYPE_LONG_INTEGER)) {

			return "integer";
		}

		if (businessType.equals(
				ObjectFieldConstants.BUSINESS_TYPE_MULTISELECT_PICKLIST) ||
			businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_PICKLIST)) {

			return "picklist";
		}

		if (businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_LONG_TEXT) ||
			businessType.equals(
				ObjectFieldConstants.BUSINESS_TYPE_PHONE_NUMBER) ||
			businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_RICH_TEXT) ||
			businessType.equals(ObjectFieldConstants.BUSINESS_TYPE_TEXT)) {

			return "text";
		}

		return null;
	}

	private static JSONObject _toPropertyJSONObject(
		long classNameId, long classTypeId, Locale locale,
		ObjectField objectField, String type) {

		JSONObject jsonObject = JSONUtil.put(
			"classNameId", classNameId
		).put(
			"classTypeId", classTypeId
		).put(
			"label", objectField.getLabel(locale, true)
		).put(
			"name", objectField.getName()
		).put(
			"type", type
		);

		if (!type.equals("picklist") ||
			(objectField.getListTypeDefinitionId() <= 0)) {

			return jsonObject;
		}

		JSONArray optionsJSONArray = JSONFactoryUtil.createJSONArray();

		for (ListTypeEntry listTypeEntry :
				ListTypeEntryLocalServiceUtil.getListTypeEntries(
					objectField.getListTypeDefinitionId())) {

			optionsJSONArray.put(
				JSONUtil.put(
					"label", listTypeEntry.getName(locale, true)
				).put(
					"value", listTypeEntry.getKey()
				));
		}

		return jsonObject.put("options", optionsJSONArray);
	}

	private static final Log _log = LogFactoryUtil.getLog(
		AssetListTypePropertiesUtil.class);

}