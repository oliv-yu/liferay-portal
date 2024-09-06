/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {ClayInput, ClaySelect} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import React from 'react';

const SCOPE_OPTIONS = {
	EVERYTHING: 'everything',
	LET_USER_CHOOSE: 'let-the-user-choose',
	THIS_SITE: 'this-site',
};

export default function SearchBarFragment({
	parameterName = 'q',
	scope = SCOPE_OPTIONS.EVERYTHING,
}) {
	const _handleSubmit = (event) => {
		event.preventDefault();
	};

	return (
		<form
			className={`${parameterName}-searchbar-form`}
			onSubmit={_handleSubmit}
		>
			{scope !== SCOPE_OPTIONS.LET_USER_CHOOSE ? (
				<ClayInput.Group>
					<ClayInput.GroupItem>
						<ClayInput
							insetAfter
							name={parameterName}
							type="text"
						/>

						<ClayInput.GroupInsetItem after>
							<ClayButton
								aria-label={Liferay.Language.get('search')}
								displayType="unstyled"
								type="submit"
							>
								<ClayIcon symbol="search" />
							</ClayButton>
						</ClayInput.GroupInsetItem>
					</ClayInput.GroupItem>

					<input name="scope" type="hidden" value={scope} />
				</ClayInput.Group>
			) : (
				<ClayInput.Group>
					<ClayInput.GroupItem prepend>
						<ClayInput name={parameterName} type="text" />
					</ClayInput.GroupItem>

					<ClayInput.GroupItem prepend shrink>
						<ClaySelect
							aria-label={Liferay.Language.get('scope')}
							name="scope"
							title={Liferay.Language.get('scope')}
						>
							<ClaySelect.Option
								key="this-site"
								label={Liferay.Language.get('this-site')}
								value="this-site"
							/>

							<ClaySelect.Option
								key="everything"
								label={Liferay.Language.get('everything')}
								value="everything"
							/>
						</ClaySelect>
					</ClayInput.GroupItem>

					<ClayInput.GroupItem append shrink>
						<ClayButton
							aria-label={Liferay.Language.get('search')}
							displayType="secondary"
							type="submit"
						>
							<ClayIcon symbol="search" />
						</ClayButton>
					</ClayInput.GroupItem>
				</ClayInput.Group>
			)}
		</form>
	);
}
