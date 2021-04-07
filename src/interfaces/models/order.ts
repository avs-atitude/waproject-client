export default interface IOrder {
  id?: number;
  description: string;
  price: number;
  quantity: number;

  createdDate?: Date;
  updatedDate?: Date;
}
