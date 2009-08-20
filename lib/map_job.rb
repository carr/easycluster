class MapJob
  # koliko maksimalno klijenata može obrađivati jedan zadatak
  MAX_PROCESSORS = 3 # TODO nije implementirano
  attr_accessor :result,
                :filename,
                :result_filename,
                :is_finished
                
  alias :is_finished? :is_finished
                  
  def initialize(filename) # valjda
    @filename = filename
    @result_filename = filename.gsub('jobs', 'results')
    @result = nil    
  end
  
  def finish(value)
    @is_finished = true
    File.open(result_filename, "wb") do |f|
      value.split(";").each do |b|
        f.putc b.to_i
      end
    end
  end
end
