import { publicAsset } from '../utils/assets';

export type Memory = {
  id: number;
  title: string;
  image: string;
};

export const memories: Memory[] = [
  {
    id: 1,
    title: 'İlk Gülüşün',
    image: publicAsset('memories/memory-1.jpg'),
  },
  {
    id: 2,
    title: 'Süslü Cimcime',
    image: publicAsset('memories/memory-2.jpg'),
  },
  {
    id: 3,
    title: 'Geceye bir ay parçası',
    image: publicAsset('memories/memory-3.jpg'),
  },
  {
    id: 4,
    title: 'Aşıklar Vadisi',
    image: publicAsset('memories/memory-4.jpg'),
  },
  {
    id: 5,
    title: 'İki aşık',
    image: publicAsset('memories/memory-5.jpg'),
  },
  {
    id: 6,
    title: 'Hep birlikte',
    image: publicAsset('memories/memory-6.jpg'),
  },
];
