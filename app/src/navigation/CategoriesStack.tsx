import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { SubcategoriesScreen } from '../screens/SubcategoriesScreen';
import { ItemsScreen } from '../screens/ItemsScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  Subcategories: { categoryId: string; categoryName: string; colorHue: number };
  Items: { categoryId: string; categoryName: string; colorHue: number };
  ItemDetail: { categoryId: string; itemId: string; categoryName: string };
};

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

export function CategoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoriesList" component={CategoriesScreen} />
      <Stack.Screen name="Subcategories" component={SubcategoriesScreen} />
      <Stack.Screen name="Items" component={ItemsScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </Stack.Navigator>
  );
}
