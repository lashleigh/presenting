class AddWidthAndHeightToSlideshows < ActiveRecord::Migration
  def self.up
    add_column :slideshows, :width, :integer, :default => 900
    add_column :slideshows, :height, :integer, :default => 700
  end

  def self.down
    remove_column :slideshows, :height
    remove_column :slideshows, :width
  end
end
