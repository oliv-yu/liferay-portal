/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayIcon from '@clayui/icon';
import ClayPanel from '@clayui/panel';
import ClayTooltipProvider from '@clayui/tooltip';
import React from 'react';

export default function SheetWrapper({children, description, helpText, title}) {
	return (
		<div className="c-mb-sm-3 sheet">
			<ClayPanel
				collapsable
				collapseHeaderClassNames="border-0 c-pt-0"
				defaultExpanded={true}
				displayTitle={
					<ClayPanel.Title>
						<div className="c-mb-0 sheet-title">
							{title}

							{!!helpText && (
								<ClayTooltipProvider>
									<span
										data-tooltip-align="bottom-left"
										title={helpText}
									>
										<ClayIcon
											className="c-ml-2 text-3 text-secondary"
											symbol="question-circle-full"
										/>
									</span>
								</ClayTooltipProvider>
							)}
						</div>
					</ClayPanel.Title>
				}
				displayType="unstyled"
				showCollapseIcon={true}
			>
				<ClayPanel.Body>
					{!!description && (
						<div className="sheet-text">{description}</div>
					)}

					{children}
				</ClayPanel.Body>
			</ClayPanel>
		</div>
	);
}
