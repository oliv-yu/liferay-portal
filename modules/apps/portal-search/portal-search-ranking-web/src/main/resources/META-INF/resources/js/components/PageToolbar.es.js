import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ClayButton from './ClayButton.es';
import {getLang} from 'utils/language.es';

class PageToolbar extends Component {
	static props = {
		submitDisabled: PropTypes.bool,
		onCancel: PropTypes.string
	};

	static defaultProps = {
		submitDisabled: true
	};

	render() {
		const {submitDisabled, onCancel} = this.props;

		return (
			<nav className="page-toolbar-root tbar upper-tbar">
				<div className="container-fluid container-fluid-max-xl">
					<ul className="tbar-nav">
						<li className="tbar-item tbar-item-expand" />

						<li className="tbar-item">
							<ClayButton
								borderless
								href={onCancel}
								label={getLang('cancel')}
								size="sm"
							/>
						</li>

						<li className="tbar-item">
							<ClayButton
								label={getLang('save-as-draft')}
								size="sm"
							/>
						</li>

						<li className="tbar-item">
							<ClayButton
								disabled={submitDisabled}
								displayStyle="primary"
								label={getLang('publish')}
								size="sm"
								type="submit"
							/>
						</li>
					</ul>
				</div>
			</nav>
		);
	}
}

export default PageToolbar;
