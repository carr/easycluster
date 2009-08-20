require 'boot'

describe "Client" do
  it "should initialize a client" do
    @c = Client.new('baba', '127.0.0.1', 'Firefox')
    @c.name.should == 'baba'
  end
  
  it "should generate random name" do
    name1 = Client.generate_random_name
    name2 = Client.generate_random_name
    name1.should_not == name2
  end
end
