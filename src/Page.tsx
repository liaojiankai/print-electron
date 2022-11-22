import {
  PageContainer,
  ProTable,
  ModalForm,
  ProFormText,
  ProCard,
} from '@ant-design/pro-components';
import { UploadOutlined, PrinterOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Upload, Button, Form, Descriptions } from 'antd';
import React, { useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import ExcelUtil from './utils/xlsx';
import { ipcRenderer } from 'electron';
import NP from 'number-precision';

type WeightBill = {
  serialNo: string;
  gargoNo: string;
  remark: string;
};

const HomePage: React.FC = () => {
  const [form] = Form.useForm<WeightBill>();

  const [visible, setVisible] = useState<boolean>(false);

  const [faceSheet, setFaceSheet] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [weightBill, setWeightBill] = useState<WeightBill>({
    serialNo: '舟山度量',
    gargoNo: '万通精煤-洗煤厂',
    remark: '发货：南阳矿极',
  });

  const columns: ProColumns[] = [
    { dataIndex: 'A', title: '日期' },
    { dataIndex: 'B', title: '车号' },
    { dataIndex: 'C', title: '毛重/Kg' },
    { dataIndex: 'D', title: '毛重/Kg' },
    { dataIndex: 'E', title: '皮重/Kg' },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, item) => {
        return [
          <Button
            key="primary"
            type="link"
            icon={<PrinterOutlined />}
            disabled={!faceSheet.length}
            onClick={() => {
              console.log({...item, ...weightBill})
              ipcRenderer.send('printData', {...item, ...weightBill});
            }}
          />,
        ];
      },
    },
  ];

  const props: UploadProps = {
    name: 'file',
    accept: '.xlsx',
    showUploadList: false,
    beforeUpload: async (file: File) => {
      try {
        setLoading(true);
        const data = await ExcelUtil.importSheet(file);
        data.shift();
        data.shift();
        console.log('data: ', data);
        setFaceSheet(data.map(item => ({...item, E: NP.minus(item.C, item.D)})));
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
      return false;
    },
  };

  return (
    <PageContainer
      ghost
      content={
        <ProCard
          layout="center"
          bordered
          extra={<Button onClick={() => setVisible(true)}>设置</Button>}
        >
          <Descriptions column={2} style={{ marginBlockEnd: -16 }}>
            <Descriptions.Item label="序号 SERLIAL NO">
              {weightBill.serialNo}
            </Descriptions.Item>
            <Descriptions.Item label="货号 GARGO NO">
              <span>{weightBill.gargoNo}</span>
            </Descriptions.Item>
            <Descriptions.Item label="备注 REMARK">
              {weightBill.remark}
            </Descriptions.Item>
          </Descriptions>
        </ProCard>
      }
    >
      <ProTable
        // showHeader={false}
        columns={columns}
        dataSource={faceSheet}
        rowKey="A"
        loading={loading}
        search={false}
        options={{
          density: false,
          reload: true,
          setting: false,
        }}
        toolBarRender={() => [
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Upload key="ipload" {...props}>
            <Button icon={<UploadOutlined />}>上传过磅单</Button>
          </Upload>,
          // <Button
          //   key="primary"
          //   icon={<PrinterOutlined />}
          //   disabled={!faceSheet.length}
          //   onClick={() => {
          //     window.print();
          //   }}
          // >
          //   打印当前页
          // </Button>,
          <Button
            key="primary"
            icon={<PrinterOutlined />}
            disabled={!faceSheet.length}
            onClick={() => setFaceSheet([])}
          >
            重置
          </Button>,
        ]}
        pagination={false}
        scroll={{ y: '60vh' }}
      />
      <ModalForm<WeightBill>
        title="过磅单 WEIGHT BILL"
        layout="horizontal"
        labelCol={{ span: 6 }}
        labelAlign="left"
        wrapperCol={{ span: 16 }}
        open={visible}
        form={form}
        width={600}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: false,
          onCancel: () => {
            setVisible(false);
          },
        }}
        submitTimeout={2000}
        onFinish={async (values) => {
          setVisible(false);
          setWeightBill(values);
          return true;
        }}
        request={() => {
          // eslint-disable-next-line no-promise-executor-return
          return new Promise((resolve) => resolve(weightBill));
        }}
      >
        <ProFormText
          name="serialNo"
          label="序号 SERLIAL NO"
          placeholder="请输入"
        />
        {/* <ProFormText name="date" label="日期 DATE" placeholder="请输入" disabled />
        <ProFormText name="time" label="时间 TIME" placeholder="请输入" disabled/>
        <ProFormText name="vehicleNo" label="车号 VEHICLE NO" placeholder="请输入" disabled/> */}
        <ProFormText
          name="gargoNo"
          label="货号 GARGO NO"
          placeholder="请输入"
        />
        {/* <ProFormText name="gross" label="总重 GROSS" placeholder="请输入" disabled/>
        <ProFormText name="tare" label="皮重 TARE" placeholder="请输入" disabled/>
        <ProFormText name="discount" label="扣率 DISCOUNT" placeholder="请输入"disabled />
        <ProFormText name="net" label="净重 NET" placeholder="请输入" disabled/> */}
        <ProFormText name="remark" label="备注 REMARK" placeholder="请输入" />
      </ModalForm>
    </PageContainer>
  );
};

export default HomePage;
