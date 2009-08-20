# predstavlja jednog klijenta koji obradjuje neki zadatak
class Client
  attr_accessor :name, :ip, :user_agent
  # inicijalizira novog klijenta po imenu
  def initialize(name, ip, user_agent)
    @name = name
    @ip = ip
    @user_agent = user_agent
  end
  
  def self.generate_random_name
    Digest::MD5.hexdigest(rand.to_s).upcase[0, 10]     #+ request.ip
  end
end
