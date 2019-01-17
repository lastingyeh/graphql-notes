const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const { customError, clearImage } = require('../utils');

module.exports = {
	createUser: async (args, req) => {
		const { email, password, name } = args.userInput;

		const errors = [];

		if (!validator.isEmail(email)) {
			errors.push({ message: 'email is invalid' });
		}

		if (
			validator.isEmpty(password) ||
			!validator.isLength(password, { min: 5 })
		) {
			error.push({ message: 'password too short' });
		}

		if (errors.length > 0) {
			// custom error throw
			throw customError('input invalid', { data: errors, code: 422 });
		}

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			throw new Error('User exists already!');
		}

		const hashPWD = await bcrypt.hash(password, 12);

		const user = await new User({
			email,
			name,
			password: hashPWD,
		}).save();

		console.log('user', user);

		return { ...user._doc, _id: user._id.toString() };
	},
	login: async ({ email, password }) => {
		const user = await User.findOne({ email });

		if (!user) {
			throw customError('user not found', { code: 401 });
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			throw customError('password is incorrect', { code: 401 });
		}

		const token = jwt.sign(
			{ userId: user._id.toString(), email: user.email },
			'somesupersecretsecret',
			{ expiresIn: '1h' },
		);

		return { token, userId: user._id.toString() };
	},
	createPost: async (args, req) => {
		// check auth
		if (!req.isAuth) {
			throw customError('user not auth', { code: 401 });
		}

		const { title, content, imageUrl } = args.postInput;
		const errors = [];

		if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
			errors.push({ message: 'title is invalid' });
		}

		if (
			validator.isEmpty(content) ||
			!validator.isLength(content, { min: 5 })
		) {
			errors.push({ message: 'content is invalid' });
		}

		if (errors.length > 0) {
			throw customError('invalid input', { data: errors, code: 422 });
		}

		const user = await User.findById(req.userId);

		if (!user) {
			throw customError('user not found', { code: 401 });
		}

		const post = await new Post({
			title,
			content,
			imageUrl,
			creator: user,
		}).save();

		user.posts.push(post);

		await user.save();

		return {
			...post._doc,
			_id: post._id.toString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
			creator: user._id.toString(),
		};
	},
	posts: async ({ page = 1 }, req) => {
		// check auth
		if (!req.isAuth) {
			throw customError('user not auth', { code: 401 });
		}

		const perPage = 2;

		const totalPosts = await Post.find().countDocuments();
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.populate('creator');

		return {
			posts: posts.map(p => ({
				...p._doc,
				_id: p._id.toString(),
				createdAt: p.createdAt.toISOString(),
				updatedAt: p.updatedAt.toISOString(),
			})),
			totalPosts,
		};
	},
	post: async ({ id }, req) => {
		// check auth
		if (!req.isAuth) {
			throw customError('user not auth', { code: 401 });
		}

		const post = await Post.findById(id).populate('creator');

		if (!post) {
			throw customError('post not found', { code: 404 });
		}

		return {
			...post._doc,
			_id: post._id.toString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		};
	},
	updatePost: async ({ id, postInput }, req) => {
		if (!req.isAuth) {
			throw customError('user not auth', { code: 401 });
		}

		const post = await Post.findById(id).populate('creator');

		if (!post) {
			throw customError('post not found', { code: 404 });
		}

		if (post.creator._id.toString() !== req.userId.toString()) {
			throw customError('not authorized', { code: 403 });
		}

		// check data validation
		const { title, content, imageUrl } = postInput;

		const errors = [];

		if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
			errors.push({ message: 'title is invalid' });
		}

		if (
			validator.isEmpty(content) ||
			!validator.isLength(content, { min: 5 })
		) {
			errors.push({ message: 'content is invalid' });
		}

		if (errors.length > 0) {
			throw customError('invalid input', { data: errors, code: 422 });
		}

		post.title = title;
		post.content = content;

		if (imageUrl) {
			post.imageUrl = imageUrl;
		}

		const updatePost = await post.save();

		return {
			...updatePost._doc,
			_id: updatePost._id.toString(),
			createdAt: updatePost.createdAt.toISOString(),
			updatedAt: updatePost.updatedAt.toISOString(),
		};
	},
	deletePost: async ({ id }, req) => {
		if (!req.isAuth) {
			throw customError('user not auth', { code: 401 });
		}

		const post = await Post.findById(id).populate('creator');

		if (!post) {
			throw customError('post not found', { code: 404 });
		}

		if (post.creator._id.toString() !== req.userId.toString()) {
			throw customError('not authorized', { code: 403 });
		}

		// findAndRemove
		await Post.findByIdAndRemove(id);

		clearImage(post.imageUrl);

		// pull post from user
		const user = await User.findById(req.userId);

		if (!user) {
			throw new Error('user not found', { code: 404 });
		}

		user.posts.pull(id);

		await user.save();

		return true;
	},
	user: async (args, req) => {
		if (!req.isAuth) {
			throw customError('user not auth', { code: 401 });
		}

		// pull post from user
		const user = await User.findById(req.userId);

		if (!user) {
			throw new Error('user not found', { code: 404 });
		}

		return {
			...user._doc,
			_id: user._id.toString(),
		};
	},
	updateStatus: async ({ status }, req) => {
		if (!req.isAuth) {
			throw customError('user not auth', { code: 401 });
		}

		// pull post from user
		const user = await User.findById(req.userId);

		if (!user) {
			throw new Error('user not found', { code: 404 });
		}

		if (status) {
			user.status = status;
		}

		const updateUser = await user.save();

		return {
			...updateUser._doc,
			_id: updateUser._id.toString(),
		};
	},
};
