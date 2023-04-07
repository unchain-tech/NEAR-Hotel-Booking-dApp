import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';

const FormDate = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');

  const isFormFilled = () => date;
  return (
    <Form>
      <Row
        className="justify-content-center"
        style={{ marginTop: '50px', marginBottom: '50px' }}
      >
        <Col xs="auto">
          <Form.Control
            type="date"
            htmlSize="10"
            onChange={(e) => {
              setDate(e.target.value);
            }}
          />
        </Col>
        <Col xs="auto">
          <Button
            variant="secondary"
            // 検索する日付が入力されないとボタンを押せないように設定
            disabled={!isFormFilled()}
            // URLに入力された日付を入れて遷移先へ渡す
            onClick={() => navigate(`/search/${date}`)}
          >
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default FormDate;
