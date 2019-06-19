import ClayButton from 'components/shared/ClayButton';
import React from 'react';
import {cleanup, render} from '@testing-library/react';

describe('ClayButton', () => {
	it('should render', () => {
		const {asFragment} = render(<ClayButton />);

		expect(asFragment()).toMatchSnapshot();
	});

	it('should render with a label', () => {
		const {container} = render(<ClayButton label='test' />);

		const button = container.querySelector('button');

		expect(button.textContent).toEqual('test');
	});
});
