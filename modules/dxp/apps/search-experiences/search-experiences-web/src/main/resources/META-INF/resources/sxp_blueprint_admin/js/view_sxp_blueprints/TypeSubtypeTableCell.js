/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

const TypeSubtypeTableCell = ({itemData, typesArray}) => {
	const getTypeSubtype = (assetTypes) => {

		// TODO : Need a way to grab the Type / Subtype Name

		// if (!assetTypes.length) {
		// 	return Liferay.Language.get('asset');
		// }

		// if (assetTypes.length === 1) {
		// 	const typeInfo = assetTypes[0].split('#');

		// 	if (!typeInfo.length === 1) {
		// 		return getDisplayNameByClassName(typeInfo[0]);
		// 	}

		// 	return `<${getDisplayNameByClassName(typeInfo[0])}> - <${getDisplayNameByERC(typeInfo[1], typeInfo[2])}>`;
		// }

		return Liferay.Language.get('asset');
	};

	const getDisplayNameByClassName = (className) => {
		return typesArray.find((type) => type.className === className)
			?.displayName;
	};

	const getDisplayNameByERC = (groupERC, subtypeERC) => {
		return typesArray.find(
			(type) =>
				type.subtypeERC === subtypeERC && type.groupERC === groupERC
		)?.displayName;
	};

	return (
		<span>
			{getTypeSubtype(
				itemData.configuration.generalConfiguration.searchableAssetTypes
			)}
		</span>
	);
};

export default TypeSubtypeTableCell;
