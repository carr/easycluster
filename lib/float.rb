class Float
  def self.round(float, num_of_decimal_places)
      exponent = num_of_decimal_places # + 2
      num = float*(10**exponent)
      num = num.round
      num = num / (10.0**exponent)
  end
end

