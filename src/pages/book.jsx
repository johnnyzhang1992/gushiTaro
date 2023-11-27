import { useState, useRef } from 'react';
import { View } from '@tarojs/components';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';

import { fetchBookData } from './poem/service';

import BookCard from '../components/BookCard';

import './index.scss';

const Page = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [books, setBooks] = useState([]);
	const optionRef = useRef({});

	const computeBook = (poems) => {
		const bookObj = {};
		poems.forEach((poem) => {
			const book = bookObj[poem.book];
			if (book) {
				book.push(poem);
			} else {
				bookObj[poem.book] = [poem];
			}
		});
		const keys = Object.keys(bookObj);
		const newBooks = keys.map((key) => {
			return {
				book: key,
				poems: bookObj[key],
			};
		});
		setBooks(newBooks);
	};
	console.log(books);
	const fetchBooks = (code, name) => {
		fetchBookData('GET', {
			code,
			name,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				console.log(res.data);
				// 拿到数据后，按照 book分类，然后渲染
				computeBook(res.data.poems || []);
			}
		});
	};

	useLoad((options) => {
		const { code, name } = options;
		console.log(options);
		setTitle(options.name);
		optionRef.current = {
			code,
			name,
		};
		fetchBooks(code, name);
	});

	usePullDownRefresh(() => {
		const { code, name } = optionRef.current;
		fetchBooks(code, name);
		Taro.stopPullDownRefresh();
	})
	return (
		<View className='page bookPage'>
			{books.map((book) => (
				<BookCard book={book.book} poems={book.poems} key={book.book} />
			))}
		</View>
	);
};

export default Page;
