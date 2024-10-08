import React, { useContext, useEffect, useRef, useState } from "react";
import type { GetRef } from "antd";
import dayjs from "dayjs";
import {
    Button,
    Form,
    Input,
    Popconfirm,
    Select,
    DatePicker,
    Table,
    Tag,
} from "antd";
import { DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import { StatusIcons } from "../../status/statusIcons";
import { IIncome } from "@/app/period/[period]/models";
import {
    createIncome,
    deleteIncomeById,
    updateIncomeById,
} from "@/app/period/[period]/services";
import { IStatus } from "@/app/settings/status/models";

const { Option } = Select;

type InputRef = GetRef<typeof Input>;
type SelectRef = GetRef<typeof Select>;
type DateRef = GetRef<typeof DatePicker>;
type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
    index: number;
}

const dateFormat = "DD/MM/YYYY";

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof IIncome;
    record: IIncome;
    statuses: IStatus[];
    handleSave: (record: IIncome) => void;
    authToken: string;
}

const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    statuses,
    handleSave,
    authToken,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const selectRef = useRef<SelectRef>(null);
    const dateRef = useRef<DateRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            if (title === "Estado") {
                selectRef.current?.focus();
            } else if (title === "Fecha de ingreso") {
                dateRef.current?.focus();
            } else {
                inputRef.current?.focus();
            }
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();

            if (values.date) {
                values.date = dayjs(values.date).startOf("day").toDate();
            }

            const newValue = { ...record, ...values };

            const response = updateIncomeById(
                newValue._id,
                newValue,
                authToken
            );

            response.then((updatedRecord) => {
                console.log(updatedRecord);
                handleSave(updatedRecord);
            });
        } catch (errInfo) {
            console.log("Save failed:", errInfo);
        }
    };

    let childNode = children;
    if (editable && title !== "Estado" && title !== "Fecha de ingreso") {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{ paddingRight: 24 }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    if (editable && title == "Estado") {
        childNode = editing ? (
            <Form.Item
                name="status"
                rules={[
                    {
                        required: true,
                        message: "Por favor seleccione un estado.",
                    },
                ]}
            >
                <Select ref={selectRef} onBlur={save} onChange={save}>
                    {statuses.map((status) => (
                        <Select.Option key={status._id} value={status._id}>
                            {status.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{ paddingRight: 24 }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    if (editable && title == "Fecha de ingreso") {
        childNode = editing ? (
            <Form.Item name="date">
                <Input
                    ref={inputRef}
                    type="date"
                    onPressEnter={save}
                    onBlur={save}
                />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{ paddingRight: 24 }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table<IIncome>>[0];

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

const IncomeTable = (params: {
    incomes: IIncome[];
    updateIncomes: any;
    period: string;
    authToken: string;
    statuses: IStatus[];
}) => {
    const [createButtonLoading, setCreateButtonLoading] = useState(false);
    const { incomes, updateIncomes, authToken, statuses } = params;

    const handleDelete = (key: string) => {
        const newData = incomes.filter((item) => item._id !== key);
        updateIncomes(newData);
        deleteIncomeById(key, authToken);
    };

    const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
    })[] = [
        {
            title: "Título",
            dataIndex: "title",
            width: "30%",
            editable: true,
        },
        {
            title: "Fecha de ingreso",
            dataIndex: "date",
            editable: true,
            render: (value) => dayjs(value).format(dateFormat),
        },
        {
            title: "Estado",
            dataIndex: "status",
            render: (status: IStatus) => (
                <Tag
                    icon={<StatusIcons status={status?.name} />}
                    color={status?.color}
                >
                    {status?.name}
                </Tag>
            ),
            editable: true,
        },
        {
            title: "Monto",
            dataIndex: "amount",
            render: (value) => <>$ {value}</>,
            editable: true,
        },
        {
            title: "",
            dataIndex: "operation",
            render: (_, record: IIncome) =>
                incomes.length >= 1 ? (
                    <Popconfirm
                        title="Sure to delete?"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <DeleteTwoTone twoToneColor="red" />
                    </Popconfirm>
                ) : null,
        },
    ];

    const handleAdd = () => {
        setCreateButtonLoading(true);
        const newData: IIncome = {
            _id: "1",
            title: `Nuevo Ingreso`,
            date: dayjs().startOf("day").toDate().toISOString(),
            status: "6553fe526562128ac0dd6f6e",
            amount: 1,
            period: params.period,
        };

        const response = createIncome(newData, authToken);

        response.then((data) => {
            updateIncomes([...incomes, data]);
            setCreateButtonLoading(false);
        });
    };

    const handleSave = (row: IIncome) => {
        const newData = [...incomes];
        const index = newData.findIndex((item) => row._id === item._id);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        updateIncomes(newData);
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: IIncome) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                statuses,
                handleSave,
                authToken,
            }),
        };
    });

    return (
        <div>
            <Button
                onClick={handleAdd}
                type="primary"
                style={{ marginBottom: 16 }}
                loading={createButtonLoading}
                icon={<PlusOutlined />}
            >
                Crear un ingreso
            </Button>
            <Table
                components={components}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={incomes}
                columns={columns as ColumnTypes}
            />
        </div>
    );
};

export default IncomeTable;
