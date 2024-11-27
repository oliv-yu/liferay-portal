/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import React from 'react';

import SheetWrapper from '../../shared/SheetWrapper';

export default function SourceSelector() {
	return (
		<SheetWrapper
			description={Liferay.Language.get('source-description')}
			helpText={Liferay.Language.get('source-help')}
			title={Liferay.Language.get('source')}
		>
			<ClayButton displayType="secondary">
				<span className="inline-item inline-item-before">
					<ClayIcon onClick={() => {}} symbol="plus" />
				</span>

				{Liferay.Language.get('select-types')}
			</ClayButton>
		</SheetWrapper>
	);
}
