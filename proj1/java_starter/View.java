import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
import java.util.ArrayList;

import javax.swing.JButton;
import java.awt.Color;

class View extends JPanel
{
	JButton b1;
	BufferedImage turtle_image;
	// ****
	// (Step 6) Then, in the View class, have it load each image from that array 
	BufferedImage[] images;
 
	// TODO: "and add it to an array of images (instead of just loading that one turtle image)."
	// ****
	Model model;

	View(Controller c, Model m, Game game)
	{
		// Make a button
		// b1 = new JButton("Never push me!");
		// b1.addActionListener(c);
		
		// ****
		// Step 5: Get rid of that useless button.
		// this.add(b1);
		// ****

		// Link up to other objects
		c.setView(this);
		model = m;

		// Send mouse events to the controller
		this.addMouseListener(c);

		// Load the turtle image
		try
		{
			this.turtle_image = ImageIO.read(new File("images/turtle.png"));
		} catch(Exception e) {
			e.printStackTrace(System.err);
			System.exit(1);
		}

		this.images = new BufferedImage[game.THINGS.length];
		for (int i = 0; i < game.THINGS.length; i++) {
			try {
				String filename = "images/"+game.THINGS[i]+".png";
				System.out.println("Filename: " + filename);
				this.images[i] = ImageIO.read(new File(filename));
			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
		}
	}

	public void paintComponent(Graphics g)
	{
		// Clear the background
		g.setColor(new Color(128, 255, 255));

		// ****
		// Step #5: Change the background to some shade of green....
		// using this color palette: https://www.color-hex.com/color-palette/100266
		g.setColor(new Color(132,208,125));
		// ****

		g.fillRect(0, 0, this.getWidth(), this.getHeight());

		// Draw the image so that its bottom center is at (x,y)
		// int w = this.turtle_image.getWidth();
		// int h = this.turtle_image.getHeight();
		// g.drawImage(this.turtle_image, model.turtle_x - w / 2, model.turtle_y - h, null);

		g.setColor(new Color(73,71,134));
		g.fillRect(0, 0, 200, 200);

		int w = this.images[model.selected_thing].getWidth();
		int h = this.images[model.selected_thing].getHeight();
		//g.drawImage(this.images[current_image], model.turtle_x - w / 2, model.turtle_y - h, null);
		g.drawImage(this.images[model.selected_thing], w - w / 2, h - h, null);

		for (int i = 0; i < model.things.size(); i++) {
			try {
				int index = model.things.get(i).kind;
				int width = this.images[model.selected_thing].getWidth();
				int height = this.images[model.selected_thing].getHeight();

				g.drawImage(this.images[index], model.things.get(i).x - width / 2, model.things.get(i).y - height, null);
			} catch(Exception e) {

			}
		}
	}
	
	void removeButton()
	{
		this.remove(this.b1);
		this.repaint();
	}
}
