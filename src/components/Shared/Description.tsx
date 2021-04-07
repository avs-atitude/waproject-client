import React, { FC } from 'react';

type DescriptionProps = {
  description: string;
  sizeShort?: number;
};

const Description: FC<DescriptionProps> = ({ description, sizeShort = 20 }) => {
  return <div title={description}>{`${description.substring(0, sizeShort)}...`}</div>;
};

export default Description;
