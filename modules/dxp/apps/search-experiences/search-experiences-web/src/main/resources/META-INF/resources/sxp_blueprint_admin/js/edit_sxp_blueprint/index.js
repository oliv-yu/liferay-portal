/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useEffect, useState} from 'react';

import useClipboardJS from '../hooks/useClipboardJS';
import ErrorBoundary from '../shared/ErrorBoundary';
import ThemeContext from '../shared/ThemeContext';
import {COPY_BUTTON_CSS_CLASS} from '../utils/constants';
import fetchData from '../utils/fetch/fetch_data';
import renameKeys from '../utils/language/rename_keys';
import transformLocale from '../utils/language/transform_locale';
import {openInitialSuccessToast} from '../utils/toasts';
import {SELECTION_MODE_TYPES} from '../utils/types/selectionModeTypes';
import EditSXPBlueprintForm from './EditSXPBlueprintForm';
import DynamicSXPForm from './unified_query_form/DynamicSXPForm';
import ManualSXPForm from './unified_query_form/ManualSXPForm';

export default function ({
	defaultLocale,
	isCompanyAdmin,
	learnMessages,
	locale,
	namespace,
	redirectURL,
	selectInfoItemsURL,
	selectSitesURL,
	sxpBlueprintId,
}) {
	const [resource, setResource] = useState(null);

	useClipboardJS('.' + COPY_BUTTON_CSS_CLASS);

	useEffect(() => {
		openInitialSuccessToast();

		fetchData(
			`/o/search-experiences-rest/v1.0/sxp-blueprints/${sxpBlueprintId}`,
			{headers: {'X-Liferay-Accept-All-Languages': true}}
		)
			.then((responseContent) => setResource(responseContent))
			.catch(() => setResource({}));
	}, []); //eslint-disable-line

	if (!resource) {
		return null;
	}

	return (
		<ThemeContext.Provider
			value={{
				availableLanguages: Liferay.Language.available,
				defaultLocale,
				isCompanyAdmin,
				learnMessages,
				locale,
				namespace,
				redirectURL,
				selectInfoItemsURL,
				selectSitesURL,
				sxpType: 'sxpBlueprint',
			}}
		>
			<div className="edit-sxp-blueprint-root">
				<ErrorBoundary>
					{Liferay.FeatureFlags['LPD-00000'] ? (
						<ManualSXPForm
							initialConfiguration={resource.configuration}
							initialDescription={resource.description}
							initialDescriptionI18n={renameKeys(
								resource.description_i18n,
								transformLocale
							)}
							initialExternalReferenceCode={
								resource.externalReferenceCode
							}
							initialSXPElementInstances={
								resource.elementInstances
							}
							initialTitle={resource.title}
							initialTitleI18n={renameKeys(
								resource.title_i18n,
								transformLocale
							)}
							sxpBlueprintId={sxpBlueprintId}
						/>
					) : resource.selectionMode ===
					  SELECTION_MODE_TYPES.DYNAMIC.value ? (
						<DynamicSXPForm
							entityJSON={resource.entityJSON}
							initialConfiguration={resource.configuration}
							initialDescription={resource.description}
							initialDescriptionI18n={renameKeys(
								resource.description_i18n,
								transformLocale
							)}
							initialExternalReferenceCode={
								resource.externalReferenceCode
							}
							initialSXPElementInstances={
								resource.elementInstances
							}
							initialTitle={resource.title}
							initialTitleI18n={renameKeys(
								resource.title_i18n,
								transformLocale
							)}
							sxpBlueprintId={sxpBlueprintId}
						/>
					) : (
						<EditSXPBlueprintForm
							entityJSON={resource.entityJSON}
							initialConfiguration={resource.configuration}
							initialDescription={resource.description}
							initialDescriptionI18n={renameKeys(
								resource.description_i18n,
								transformLocale
							)}
							initialExternalReferenceCode={
								resource.externalReferenceCode
							}
							initialSXPElementInstances={
								resource.elementInstances
							}
							initialTitle={resource.title}
							initialTitleI18n={renameKeys(
								resource.title_i18n,
								transformLocale
							)}
							sxpBlueprintId={sxpBlueprintId}
						/>
					)}
				</ErrorBoundary>
			</div>
		</ThemeContext.Provider>
	);
}
