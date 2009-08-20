require 'boot'

describe "Job assignment" do
  before do 
    @job = MapJob.new('compress/01.txt')
    @c = Client.new('baba', '127.0.0.1', 'Firefox')
    @ja = JobAssignment.new(@job, @c)
  end
  
  it "should set timeout" do
    @ja.timeout = 3
    @ja.timeout.should == 3
  end
  
  it "should timeout" do
    @ja.timeout = 0.2
    sleep(0.3)
    @ja.has_timed_out?.should == true
  end
  
  it "should not timeout" do
    @ja.timeout = 0.2
    sleep(0.1)
    @ja.has_timed_out?.should == false
  end
  
  it "should finish" do
    @ja.finish("300;400", 300)
    @ja.has_finished?.should == true
    File.delete('compress/01.txt')
  end
end
