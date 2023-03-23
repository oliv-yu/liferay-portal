/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

import ClayButton from '@clayui/button';
import ClayPopover from '@clayui/popover';
import {render} from '@liferay/frontend-js-react-web';
import React, {useState} from 'react';

function getSettingsPageTitleElement(stringToMatch) {
	const h2Elements = Array.from(document.querySelectorAll('h2'));

	if (h2Elements.length) {
		return h2Elements.find(
			(element) => element.textContent.trim() === stringToMatch.trim()
		);
	}

	return null;
}

function getVerticalNavigationElement(stringToMatch) {
	const navItemElements = Array.from(document.querySelectorAll('.nav-item'));

	if (navItemElements.length) {
		return navItemElements.find(
			(element) => element.textContent.trim() === stringToMatch.trim()
		);
	}

	return null;
}

function BetaLabel() {
	const [showPopover, setShowPopover] = useState(false);

	return (
		<ClayPopover
			alignPosition="bottom"
			header={Liferay.Language.get('beta-feature')}
			onShowChange={setShowPopover}
			show={showPopover}
			trigger={
				<ClayButton
					borderless
					onMouseEnter={() => setShowPopover(true)}
					onMouseLeave={() => setShowPopover(false)}
					rounded
					size="xs"
					style={{
						backgroundColor: '#eef2fa',
						color: '#234584',
						textTransform: 'uppercase',
					}}
				>
					{Liferay.Language.get('beta')}
				</ClayButton>
			}
		>
			{Liferay.Language.get('beta-feature-help')}
		</ClayPopover>
	);
}

/**
 * Inserts a "Beta" label next to:
 * (1) The page title
 * (2) The vertical navigation bar
 * @param {string} _.stringToMatch The string to find to insert the label next to.
 */
export default function ({stringToMatch}) {
	// Insert to page title.

	const settingsPageTitleElement = getSettingsPageTitleElement(stringToMatch);

	if (settingsPageTitleElement) {
		const settingsPageTitleRoot = settingsPageTitleElement.appendChild(
			document.createElement('span')
		);

		render(BetaLabel, {}, settingsPageTitleRoot);
	}

	// Insert to vertical navigation bar.

	const verticalNavigationElement = getVerticalNavigationElement(
		stringToMatch
	);

	if (verticalNavigationElement) {
		const verticalNavigationRoot = verticalNavigationElement.appendChild(
			document.createElement('span')
		);

		render(BetaLabel, {}, verticalNavigationRoot);
	}
}
