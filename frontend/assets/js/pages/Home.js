import FormDate from '../components/FormDate';

const Home = () => {
  return (
    <>
      <div className="text-center" style={{ margin: '200px' }}>
        <h1>Welcome.</h1>
        <h1>Select your stay dates and find a hotel!</h1>
        <FormDate />
      </div>
      <div className="text-center">
        <p>
          Owners who wish to list their rooms should connect to the NEAR Wallet.
        </p>
      </div>
    </>
  );
};

export default Home;
