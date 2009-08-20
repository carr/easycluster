module Finders
  def find_assignments(filename, client)
    @job_assignments.find_all do |ja|
      ja.job.filename == filename and ja.client.name == client.name 
    end    
  end   
  
  def find_or_initialize_client(name, request, params)
    client = find_client(name, request)
    if client.nil?
      client = Client.new(name, request.ip, params[:agent])
      @clients << client
    end
    client
  end
  
  def find_client(name, request)
    cl = @clients.find_all{|c| c.name == name and c.ip == request.ip}    
    raise "Shit" if cl.size>1
    cl.first
  end
  
  def find_finished_assignments_for_client(name)
    @job_assignments_finished.find_all{|ja| ja.client.name == name }
  end  
end
