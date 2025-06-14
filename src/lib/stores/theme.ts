import { writable } from 'svelte/store';

export type ThemeColors = {
	name: string;
	transform: string;
	color: string;
	backgroundColor: { r: number; g: number; b: number };
	sidebarColor: { r: number; g: number; b: number };
	rotation: number;
};

export const colors: ThemeColors[] = [
	{
		name: 'indigo',
		transform: 'translate(35.429971, 9.626175)',
		color: '#9c9c9c',
		backgroundColor: { r: 13, g: 13, b: 13 },
		sidebarColor: { r: 15, g: 15, b: 15 },
		rotation: -51.42857142857143
	},
	{
		name: 'black',
		transform: 'translate(21.096440, 2.723510)',
		color: '#505050',
		backgroundColor: { r: 5, g: 5, b: 5 },
		sidebarColor: { r: 8, g: 8, b: 8 },
		rotation: 0
	},
	{
		name: 'green',
		transform: 'translate(38.970061, 25.136322)',
		color: '#CDFF6B',
		backgroundColor: { r: 29, g: 36, b: 32 },
		sidebarColor: { r: 25, g: 25, b: 19 },
		rotation: -102.85714285714286
	},
	{
		name: 'grey',
		transform: 'translate(29.050950, 37.574495)',
		color: '#B1D0C8',
		backgroundColor: { r: 18, g: 20, b: 18 },
		sidebarColor: { r: 22, g: 24, b: 19 },
		rotation: -154.28571428571428
	},
	{
		name: 'red',
		transform: 'translate(13.141930, 37.574495)',
		color: '#FE4E50',
		backgroundColor: { r: 23, g: 22, b: 17 },
		sidebarColor: { r: 17, g: 18, b: 14 },
		rotation: -205.71428571428572
	},
	{
		name: 'paper',
		transform: 'translate(2.544417, 24.457921)',
		color: '#8abd95',
		backgroundColor: { r: 55, g: 65, b: 57 },
		sidebarColor: { r: 60, g: 71, b: 62 },
		rotation: -257.14285714285717
	},
	{
		name: 'blue',
		transform: 'translate(6.762908, 9.626175)',
		color: '#2C27FF',
		backgroundColor: { r: 32, g: 32, b: 53 },
		sidebarColor: { r: 38, g: 38, b: 66 },
		rotation: -308.57142857142856
	}
];

export const currentTheme = writable<ThemeColors>(colors[0]);

export const setThemeByName = (themeName: string) => {
	const theme = colors.find((t) => t.name === themeName);
	if (theme) {
		currentTheme.set(theme);
	}
};
