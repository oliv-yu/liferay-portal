import Alias from 'components/alias/Alias';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {cleanup, fireEvent, render, wait, within} from '@testing-library/react';

const MODAL_ID = 'alias-modal';

describe('Alias', () => {
	/*
	Console error occurs when React state should be wrapped in 'act',
	link for reference.
	https://github.com/testing-library/react-testing-library/issues/281#issuecomment-480349256
	 */
	const originalError = console.error;

	beforeAll(() => {
		console.error = (...args) => {
			if (
				/Warning.*not wrapped in act/.test(args[0]) ||
				/Warning: Can't perform a React state update/.test(args[0])
			) {
				return;
			}
			originalError.call(console, ...args);
		};
	});

	afterAll(() => {
		console.error = originalError;
	});

	it('should have a list of tags available', () => {
		const {container} = render(
			<Alias
				keywords={['one', 'two', 'three']}
				onClickDelete={jest.fn()}
				onClickSubmit={jest.fn()}
				searchTerm={'example'}
			/>
		);

		const tagsElement = container.querySelectorAll('.label-item-expand');

		expect(tagsElement[0]).toHaveTextContent('one');
		expect(tagsElement[1]).toHaveTextContent('two');
		expect(tagsElement[2]).toHaveTextContent('three');
	});

	it('should not show a modal by default', () => {
		const {queryByTestId} = render(
			<Alias
				keywords={['one', 'two', 'three']}
				onClickDelete={jest.fn()}
				onClickSubmit={jest.fn()}
				searchTerm={'example'}
			/>
		);

		expect(queryByTestId(MODAL_ID)).toBeNull();
	});

	it('should render a modal when the add an alias button gets clicked', () => {
		const {getByText, queryByTestId} = render(
			<Alias
				keywords={['one', 'two', 'three']}
				onClickDelete={jest.fn()}
				onClickSubmit={jest.fn()}
				searchTerm={'example'}
			/>
		);

		fireEvent.click(getByText('Add an Alias'));

		expect(queryByTestId(MODAL_ID)).not.toBeNull();
	});

	it('should close the modal after the cancel button gets clicked', async () => {
		const {getByTestId, getByText, queryByTestId} = render(
			<Alias
				keywords={['one', 'two', 'three']}
				onClickDelete={jest.fn()}
				onClickSubmit={jest.fn()}
				searchTerm={'example'}
			/>
		);

		fireEvent.click(getByText('Add an Alias'));

		fireEvent.click(within(getByTestId(MODAL_ID)).getByText('Cancel'));

		await wait(() => {
			expect(queryByTestId(MODAL_ID)).not.toBeInTheDocument();
		});
	});

	it('should prompt to input an alias', () => {
		const {getByText, queryByText} = render(
			<Alias
				keywords={['one', 'two', 'three']}
				onClickDelete={jest.fn()}
				onClickSubmit={jest.fn()}
				searchTerm={'example'}
			/>
		);

		fireEvent.click(getByText('Add an Alias'));

		expect(
			queryByText('Type a comma or press enter to input an alias')
		).not.toBeNull();
	});

	it('should have the modal with a default disabled add button', () => {
		const {getByText, queryByTestId} = render(
			<Alias
				keywords={['one', 'two', 'three']}
				onClickDelete={jest.fn()}
				onClickSubmit={jest.fn()}
				searchTerm={'example'}
			/>
		);

		fireEvent.click(getByText('Add an Alias'));

		expect(
			within(queryByTestId(MODAL_ID)).getByText('Add')
		).toHaveAttribute('disabled');
	});

	it('should not render blank keywords', () => {
		const {container} = render(
			<Alias
				keywords={['', ' ']}
				onClickDelete={jest.fn()}
				onClickSubmit={jest.fn()}
				searchTerm={'example'}
			/>
		);

		const tagsElement = container.querySelectorAll('.label-item');

		expect(tagsElement.length).toBe(0);
	});
});
