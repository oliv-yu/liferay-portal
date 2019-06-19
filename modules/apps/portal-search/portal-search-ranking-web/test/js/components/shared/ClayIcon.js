import ClayIcon from 'components/shared/ClayIcon';
import React from 'react';
import {cleanup, render} from '@testing-library/react';

describe('ClayIcon', () => {
	it('should render', () => {
		const {asFragment} = render(<ClayIcon iconName='times' />);

		expect(asFragment()).toMatchSnapshot();
	});
});
