require 'boot'

describe "MapJob" do
  before do
    @m = MapJob.new('compress/jobs/01.txt')    
  end
  
  it "should be finished" do
    @m.finish("100;200")
    @m.is_finished?.should be true
  end
  
  it "should finish correctly" do
    @m.finish("100;200")
    File.open(@m.result_filename, 'rb').read[0].should be 100
    File.open(@m.result_filename, 'rb').read[1].should be 200    
  end
  
  it "should not be finished" do
    @m.is_finished?.should_not be true
  end
  
  it "should initialize filename" do 
    @m.filename.should == 'compress/jobs/01.txt'
  end
  
  it "should have result filename" do 
    @m.result_filename.should == 'compress/results/01.txt'    
  end
end
